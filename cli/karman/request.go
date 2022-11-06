package karman

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type Cause struct {
	Message  string `json:"message"`
	Path     string `json:"path"`
	Location string `json:"location"`
}

type BackendError struct {
	Code    string  `json:"code"`
	Message string  `json:"message"`
	Causes  []Cause `json:"causes"`
}

func Request[T interface{}](value *T, method string, url string, body io.Reader, expectedStatusCode int) error {
	context, err := GetContext()
	if err != nil {
		return err
	}
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: "session-token", Value: context.SessionToken})
	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		return err
	}
	if resp.StatusCode != expectedStatusCode {
		bodyText, _ := io.ReadAll(resp.Body)
		var backendError = &BackendError{}
		decoder := json.NewDecoder(strings.NewReader(string(bodyText)))
		decoder.DisallowUnknownFields()
		err := decoder.Decode(backendError)
		if err != nil {
			return errors.New(fmt.Sprintf("request: [%s] (expected [%d]) %s (%s)", resp.Status, expectedStatusCode, string(bodyText), err))
		}
		if len(backendError.Causes) == 1 {
			return errors.New(fmt.Sprintf("request: [%s] %s (%s %s)", backendError.Code, backendError.Message, backendError.Causes[0].Path, backendError.Causes[0].Message))
		}
		return errors.New(fmt.Sprintf("request: [%s] %s", backendError.Code, backendError.Message))

	}
	if value != nil {
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		responseBody := string(bodyBytes)
		decoder := json.NewDecoder(strings.NewReader(responseBody))
		decoder.DisallowUnknownFields()
		err = decoder.Decode(value)
		if err != nil {
			return err
		}
	}
	return nil
}
