package model

import "gerenciador-de-projetos-back/internal/utils"

func ValidateError(err error, warning bool, logger *utils.LoggerImpl) {
	if err != nil {
		if warning && logger != nil {
			logger.Warn("%v", err)
		} else if logger != nil {
			logger.Error("%v", err)
			panic(err)
		} else {
			panic(err)
		}
	}
}
