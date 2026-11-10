package model

import "time"

type ProjectPayload struct {
	Name       string    `json:"name"`
	Client     string    `json:"client"`
	StartDate  time.Time `json:"start_date"`
	EndDate    time.Time `json:"end_date"`
	IsFavorite bool      `json:"is_favorite"`
}

type ProjectModel struct {
	ProjectPayload
	BaseModel
}

type ProjectSortBy int

const (
	NameAsc ProjectSortBy = iota
	NameDesc
	StartDateAsc
	StartDateDesc
	EndDateAsc
	EndDateDesc
)
