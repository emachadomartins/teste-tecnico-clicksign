package router

import (
	"gerenciador-de-projetos-back/internal/config"
	"gerenciador-de-projetos-back/internal/database"
	"gerenciador-de-projetos-back/internal/handler"
	"gerenciador-de-projetos-back/internal/repository"
	"gerenciador-de-projetos-back/internal/storage"
	"gerenciador-de-projetos-back/internal/utils"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
)

func New(c config.Config, l *utils.LoggerImpl) *chi.Mux {

	l.Info("Connecting to database...")
	db, err := database.Connect(c.DatabaseURL)

	if err != nil {
		l.Error("Error connecting to database: %s", err)
		panic(err)
	}

	l.Info("Creating router")
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   c.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Server is running"))
	})

	coverImageStorage := storage.NewLocalStorage(c.UploadsBasePath)

	projectRepo := repository.NewProjectRepository(db)
	projectHandler := handler.NewProjectHandler(projectRepo, coverImageStorage)

	r.Mount(projectHandler.Path, projectHandler.Routes())

	return r
}
