import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { prisma } from "../db/client.js";
import { generateAccessToken, generateRefreshToken, hashToken, hashPassword } from "../services/auth.js";
import { notifyProvider } from "../providers/index.js";
import { CURRENT_TERMS_VERSION } from "@monologg/types";

const googleAuthSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  userType: z.enum(["TALENT", "CLIENT"]).default("TALENT"),
  googleId: z.string().optional(),
  picture: z.string().optional(),
});

export async function googleAuthRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/v1/auth/google", async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = googleAuthSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Bad Request",
        message: parsed.error.issues.map((i) => i.message).join(", "),
        statusCode: 400,
      });
    }

    const { email, name, userType, googleId, picture } = parsed.data;
    const effectiveGoogleId = googleId || `google-sub-${randomUUID().slice(0, 8)}`;

    // Check if user already exists by email or googleId
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId: effectiveGoogleId }],
      },
      include: { creator: true, client: true },
    });

    let isCreated = false;

    if (!user) {
      isCreated = true;
      const dummyPasswordHash = await hashPassword(`GAuth-${randomUUID()}`);
      const referralCode = `REF-${name.replace(/\s+/g, "").toUpperCase()}-${randomUUID().slice(0, 4)}`;

      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash: dummyPasswordHash,
            userType,
            emailVerified: true,
            authProvider: "GOOGLE",
            googleId: effectiveGoogleId,
            isNewUser: true,
          },
        });

        if (userType === "TALENT") {
          await tx.creator.create({
            data: {
              userId: newUser.id,
              name,
              location: "Lagos, Nigeria",
              niche: "CONTENT_CREATOR",
              referralCode,
              mediaKit: { create: {} },
            },
          });
        } else {
          await tx.client.create({
            data: {
              userId: newUser.id,
              name,
              location: "Lagos, Nigeria",
              orgName: `${name} Productions`,
            },
          });
        }

        await tx.termsAcceptance.create({
          data: { userId: newUser.id, version: CURRENT_TERMS_VERSION },
        });

        await tx.userActivity.create({
          data: {
            userId: newUser.id,
            action: "USER_REGISTERED",
            details: `Registered via Google OAuth as ${userType}`,
          },
        });

        return tx.user.findUniqueOrThrow({
          where: { id: newUser.id },
          include: { creator: true, client: true },
        });
      });

      // Send welcome notification
      await notifyProvider.email(email, "welcome", { name, userType });
    } else {
      // Log login activity for existing Google user
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          action: "USER_LOGGED_IN",
          details: "Signed in via Google OAuth",
        },
      });
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      userType: user.userType,
      email: user.email,
    });

    const tokenJti = randomUUID();
    const refreshToken = generateRefreshToken(user.id, tokenJti);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return reply.status(isCreated ? 201 : 200).send({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.creator?.name || user.client?.name || name,
        userType: user.userType,
        authProvider: user.authProvider,
        isNewUser: user.isNewUser,
        picture: picture || null,
      },
      welcomeLink: isCreated ? `/onboarding?welcome=true` : undefined,
    });
  });
}
