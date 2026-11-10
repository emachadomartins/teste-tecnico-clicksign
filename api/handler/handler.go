package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Method int

const (
	MethodGet Method = iota
	MethodPost
	MethodPut
	MethodPatch
	MethodDelete
)

func (m Method) String() string {
	switch m {
	case MethodGet:
		return "GET"
	case MethodPost:
		return "POST"
	case MethodPut:
		return "PUT"
	case MethodPatch:
		return "PATCH"
	case MethodDelete:
		return "DELETE"
	default:
		return ""
	}
}

func NewRoute(
	r *chi.Mux,
	path string,
	method Method,
	fn func(w http.ResponseWriter, r *http.Request),
) *chi.Mux {
	if r == nil {
		panic("router cannot be nil")
	}

	if path[0] != '/' {
		path = "/" + path
	}

	switch method {
	case MethodGet:
		r.Get(path, fn)
		return r
	case MethodPost:
		r.Post(path, fn)
		return r
	case MethodPut:
		r.Put(path, fn)
		return r
	case MethodPatch:
		r.Patch(path, fn)
		return r
	case MethodDelete:
		r.Delete(path, fn)
		return r
	default:
		panic("invalid method")
	}
}
