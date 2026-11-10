package utils

func ThrowError(err error, logger *LoggerImpl) {
	if logger != nil {
		logger.Error("%v", err)
		panic(err)
	}
}

func ThrowWarning(err error, logger *LoggerImpl) {
	if logger != nil {
		logger.Warn("%v", err)
	}
}

func ValidateError(err error, warning bool, logger *LoggerImpl) {
	if err != nil {
		if warning {
			ThrowWarning(err, logger)
		} else {
			ThrowError(err, logger)
		}
	}
}
