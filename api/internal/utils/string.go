package utils

import (
	"strings"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

func NormalizeWord(s string) string {
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	result, _, _ := transform.String(t, s)
	return strings.ToLower(result)
}

func WordToTerms(word string) []string {
	terms := []string{}
	for _, term := range strings.Fields(word) {
		terms = append(terms, NormalizeWord(term))
	}

	return terms
}
