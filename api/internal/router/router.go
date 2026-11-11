package router

import (
	"gerenciador-de-projetos-back/internal/handler"
	"gerenciador-de-projetos-back/internal/repository"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"gorm.io/gorm"
)

func New(db *gorm.DB, allowedOrigins []string) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Server is running"))
	})

	projectRepo := repository.NewProjectRepository(db)
	projectHandler := handler.NewProjectHandler(projectRepo)

	r.Mount(projectHandler.Path, projectHandler.Routes())

	return r
}
