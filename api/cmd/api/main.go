package main

import (
	"log"
	"net/http"

	"gerenciador-de-projetos-back/internal/config"
	"gerenciador-de-projetos-back/internal/router"
	"gerenciador-de-projetos-back/internal/utils"
)

func main() {
	config := config.Load()
	r := router.New(config.AllowedOrigins)

	l := utils.NewLogger("api")

	l.Info("🔥 Starting server on port %s", config.Port)
	if err := http.ListenAndServe(config.Port, r); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}

}
