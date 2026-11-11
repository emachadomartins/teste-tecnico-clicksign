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
	Name        string `json:"name"`
	Client      string `json:"client"`
	IsFavorite  bool   `json:"is_favorite"`
	InitialDate Date   `json:"initial_date"`
	FinalDate   Date   `json:"final_date"`
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
