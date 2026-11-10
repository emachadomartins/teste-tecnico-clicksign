package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"gerenciador-de-projetos-back/routes"

	"github.com/go-chi/chi/v5"
)

func main() {
	r := chi.NewRouter()

	routes.NewRoute(r, "/ping", routes.MethodGet, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "pong"})
	})

	fmt.Println("Gerenciador de Projetos rodando em http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
