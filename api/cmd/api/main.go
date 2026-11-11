package main

import (
	"log"
	"net/http"

	"gerenciador-de-projetos-back/internal/config"
	"gerenciador-de-projetos-back/internal/database"
	"gerenciador-de-projetos-back/internal/router"
	"gerenciador-de-projetos-back/internal/utils"
)

func main() {
	config := config.Load()

	db, err := database.Connect(config.DatabaseURL)

	l := utils.NewLogger("api")
	if err != nil {
		log.Fatal(err)
	}
	r := router.New(db, config.AllowedOrigins)

	l.Info("🔥 Starting server on port %s", config.Port)
	if err := http.ListenAndServe(config.Port, r); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}

}
