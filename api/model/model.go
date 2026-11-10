package model

import (
	"time"
)

type BaseModel struct {
	ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Operator int

const (
	EqualOperator Operator = iota
	NotEqualOperator
	LikeOperator
)

type QueryFilter struct {
	Column   string
	Operator Operator
	Value    any
}
