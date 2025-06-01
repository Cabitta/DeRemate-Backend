import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { envConfig } from "./utils/envConfig.js";
import Delivery from "./models/delivery.js";
import bcrypt from "bcryptjs";

// Asegúrate de que JWT_SECRET esté disponible
const secretOrKey =
  envConfig.JWT_SECRET || "fallback_secret_key_only_for_development";

if (!envConfig.JWT_SECRET) {
  console.warn(
    "⚠️  ADVERTENCIA: JWT_SECRET no está definido en las variables de entorno. Usando clave por defecto (inseguro para producción)."
  );
}

const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretOrKey,
};

export const configurePassport = () => {
  // JWT Strategy
  passport.use(
    "jwt",
    new JwtStrategy(jwtOpts, async (jwt_payload, done) => {
      try {
        const user = await Delivery.findById(jwt_payload.id).select(
          "-password"
        );

        if (user) {
          if (!user.active) {
            return done(null, false, { message: "Cuenta no verificada" });
          }
          return done(null, user);
        } else {
          return done(null, false, { message: "Usuario no encontrado" });
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Local Strategy
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await Delivery.findOne({ email });

          if (!user) {
            return done(null, false, { message: "Usuario no encontrado" });
          }

          if (!user.active) {
            return done(null, false, { message: "Cuenta no verificada" });
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false, { message: "Contraseña incorrecta" });
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  return passport;
};
