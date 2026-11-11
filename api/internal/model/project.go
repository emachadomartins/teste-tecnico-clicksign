package model

import "fmt"

type ProjectPayload struct {
	Name        *string `json:"name"`
	Client      *string `json:"client"`
	InitialDate *Date   `json:"initial_date"`
	FinalDate   *Date   `json:"final_date"`
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
		return fmt.Errorf("Name is required")
	}
	if p.Client == "" {
		return fmt.Errorf("Client is required")
	}
	if p.InitialDate.IsZero() {
		return fmt.Errorf("InitialDate is required")
	}
	if p.FinalDate.IsZero() {
		return fmt.Errorf("FinalDate is required")
	}
	if p.InitialDate.After(p.FinalDate.Time) {
		return fmt.Errorf("InitialDate cannot be after FinalDate")
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
