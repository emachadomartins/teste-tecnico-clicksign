package model

import "strings"

type ProjectPayload struct {
	Name        *string `json:"name"`
	Client      *string `json:"client"`
	InitialDate *Date   `json:"initial_date"`
	FinalDate   *Date   `json:"final_date"`
}

func (p ProjectPayload) RequiredFieldsError() error {
	var missing []string
	if p.Name == nil {
		missing = append(missing, "name")
	}
	if p.Client == nil {
		missing = append(missing, "client")
	}
	if p.InitialDate == nil {
		missing = append(missing, "initial_date")
	}
	if p.FinalDate == nil {
		missing = append(missing, "final_date")
	}

	if len(missing) > 0 {
		return NewValidationError("missing required fields: " + strings.Join(missing, ", "))
	}
	return nil
}

type ProjectModel struct {
	BaseModel
	Name        string  `json:"name"`
	Client      string  `json:"client"`
	IsFavorite  bool    `json:"is_favorite"`
	InitialDate Date    `json:"initial_date"`
	FinalDate   Date    `json:"final_date"`
	CoverURL    *string `json:"cover_url,omitempty"`
}

type FavoritePayload struct {
	IsFavorite *bool `json:"is_favorite"`
}

func (p *ProjectModel) Validate() error {
	if p.Name == "" {
		return NewValidationError("Name is required")
	}
	if p.Client == "" {
		return NewValidationError("Client is required")
	}
	if p.InitialDate.IsZero() {
		return NewValidationError("InitialDate is required")
	}
	if p.FinalDate.IsZero() {
		return NewValidationError("FinalDate is required")
	}
	if p.InitialDate.After(p.FinalDate.Time) {
		return NewValidationError("InitialDate cannot be after FinalDate")
	}

	return nil
}

type SortBy int

const (
	SortByName SortBy = iota
	SortByInitialDate
	SortByFinalDate
)

func (s SortBy) String() string {
	switch s {
	case SortByName:
		return "name"
	case SortByInitialDate:
		return "initial_date"
	case SortByFinalDate:
		return "final_date"
	default:
		return "unknown"
	}
}

func ToSortBy(s string) SortBy {
	switch s {
	case "name":
		return SortByName
	case "initial_date":
		return SortByInitialDate
	case "final_date":
		return SortByFinalDate
	default:
		return SortByName
	}
}

type ProjectFilter struct {
	Term          string `json:"term"`
	FavoritesOnly bool   `json:"favorites_only"`
	Sort          SortBy `json:"sort_by"`
}

type ProjectQuery struct {
	Terms         []string `json:"terms"`
	FavoritesOnly bool     `json:"favorites_only"`
	Sort          SortBy   `json:"sort_by"`
}
