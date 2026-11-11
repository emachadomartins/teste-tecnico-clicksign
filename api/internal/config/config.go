package config

import (
	"fmt"
	"gerenciador-de-projetos-back/internal/utils"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	AllowedOrigins  []string
	DatabaseURL     string
	UploadsBasePath string
}

func loadEnv(envKey string, required bool, defaultValue string, l *utils.LoggerImpl) (string, error) {
	envValue := os.Getenv(envKey)

	if envValue == "" {
		if required && defaultValue == "" {
			return "", fmt.Errorf("environment variable %s is required but not set", envKey)
		}
		envValue = defaultValue
	}

	if l != nil {
		l.Info("Loaded environment variable %s: %s", envKey, envValue)
	}
	return envValue, nil
}

func Load() Config {
	l := utils.NewLogger("config")
	l.Info("Loading Environment Variables")

	if e := godotenv.Load(); e != nil {
		utils.ThrowWarning(fmt.Errorf("no .env file found, relying on environment variables"), l)
	}

	port, err := loadEnv("PORT", false, "8080", l)

	utils.ValidateError(err, false, l)

	if port[0] != ':' {
		port = ":" + port
	}

	databaseUrl, err := loadEnv("DATABASE_URL", true, "", l)

	utils.ValidateError(err, false, l)

	uploadsBasePath, err := loadEnv("UPLOADS_BASE_PATH", false, "uploads", l)

	utils.ValidateError(err, false, l)

	allowedOrigins, err := loadEnv("ALLOWED_ORIGINS", false, "http://localhost:5000,http://127.0.0.1:5000", l)

	utils.ValidateError(err, false, l)

	return Config{
		Port:            port,
		AllowedOrigins:  strings.Split(allowedOrigins, ","),
		DatabaseURL:     databaseUrl,
		UploadsBasePath: uploadsBasePath,
	}
}
