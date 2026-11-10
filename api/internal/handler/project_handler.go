package handler

import (
	"gerenciador-de-projetos-back/internal/model"
	"gerenciador-de-projetos-back/internal/service"
	"net/http"

	"github.com/go-chi/chi"
)

type ProjectHandler struct {
	HandlerImpl
	service service.ProjectService
}

func (h *ProjectHandler) GetMany(w http.ResponseWriter, r *http.Request) {
	projects := h.service.List()

	respondList(w, projects, h.logger)
}

func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {

	payload, err := decodeBodyJson[model.ProjectPayload](r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}
	project, err := h.service.Create(payload)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err, h.logger)
		return
	}

	respondJSON(w, http.StatusCreated, project, h.logger)
}

func (h *ProjectHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}

	project, err := h.service.Read(id)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)
		return
	}

	respondJSON(w, http.StatusOK, project, h.logger)
}

func (h *ProjectHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}
	payload, err := decodeBodyJson[model.ProjectPayload](r)

	project, err := h.service.Update(id, payload)
	if err != nil {
		respondError(w, http.StatusNotFound, err, h.logger)
		return
	}

	respondJSON(w, http.StatusOK, project, h.logger)
}

func (h *ProjectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromRequest(r)
	if err != nil {
		respondError(w, http.StatusBadRequest, err, h.logger)
		return
	}

	err = h.service.Delete(id)
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

func NewProjectHandler() *ProjectHandler {
	h := NewHandler("project")

	s := service.NewProjectService(h.logger)

	return &ProjectHandler{
		HandlerImpl: *h,
		service:     *s,
	}
}
