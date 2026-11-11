package handler

import (
	"gerenciador-de-projetos-back/internal/model"
	"gerenciador-de-projetos-back/internal/repository"
	"gerenciador-de-projetos-back/internal/service"
	"net/http"

	"github.com/go-chi/chi"
)

type ProjectHandler struct {
	HandlerImpl
	service service.ProjectService
}

func (h *ProjectHandler) GetMany(w http.ResponseWriter, r *http.Request) {
	projects, err := h.service.List(r.Context())

	if err != nil {
		respondError(w, http.StatusInternalServerError, err, h.logger)
		return
	}

	respondList(w, projects, h.logger)
}

func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {

	payload, err := decodeBodyJson[model.ProjectPayload](r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}
	project, err := h.service.Create(r.Context(), payload)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err, h.logger)
		return
	}

	respondSingle(w, http.StatusCreated, project, h.logger)
}

func (h *ProjectHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}

	project, err := h.service.Read(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)
		return
	}

	respondSingle(w, http.StatusOK, project, h.logger)
}

func (h *ProjectHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}
	payload, err := decodeBodyJson[model.ProjectPayload](r)

	project, err := h.service.Update(r.Context(), id, payload)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)
		return
	}

	respondSingle(w, http.StatusOK, project, h.logger)
}

func (h *ProjectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}

	err = h.service.Delete(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ProjectHandler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Get("/", h.GetMany)
	r.Post("/", h.Create)
	r.Get("/{id}", h.GetByID)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
	return r
}

func NewProjectHandler(r *repository.ProjectRepository) *ProjectHandler {
	h := NewHandler("project")

	s := service.NewProjectService(h.logger, r)

	return &ProjectHandler{
		HandlerImpl: *h,
		service:     *s,
	}
}
