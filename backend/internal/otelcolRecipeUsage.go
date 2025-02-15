package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const (
	postRecipeUsageErrMsg = "Error while saving recipe usage"
	getRecipeUsageErrMsg  = "Error while returning the recipe usage"
)

func (s *Server) getRecipeUsageHandler(w http.ResponseWriter, r *http.Request) {
	query := "SELECT COUNT(*) FROM recipe_usage"
	row := s.db.QueryRow(query)

	var count int
	if err := row.Scan(&count); err != nil {
		s.ErrorResponse(w, r, err.Error(), http.StatusInternalServerError)
		s.logger.Sugar().Errorf("%s: Error getting recipe usage from db", getRecipeUsageErrMsg)
		return
	}

	response := map[string]int{
		"count": count,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		s.ErrorResponse(w, r, err.Error(), http.StatusInternalServerError)
		s.logger.Sugar().Errorf("%s: Error streaming generated YAML output to client", getRecipeUsageErrMsg)
	}
}

type UsedRecipe struct {
	Name string `json:"name"`
}

func (s *Server) postRecipeUsageHandler(w http.ResponseWriter, r *http.Request) {
	var ur UsedRecipe
	err := json.NewDecoder(r.Body).Decode(&ur)
	if err != nil {
		s.ErrorResponse(w, r, "Invalid JSON body", http.StatusBadRequest)
		s.logger.Sugar().Errorf("%s: Error decoding request JSON body", postRecipeUsageErrMsg)
		return
	}

	currentTime := time.Now()
	sqlValues := fmt.Sprintf("NULL, '%s', '%s'",
		ur.Name,
		currentTime.Format("2006-01-02 15:04:05"),
	)

	err = insertIntoTable(s.db, s.dbs.recipeUsageTable, sqlValues)
	if err != nil {
		s.db.Close()
		s.logger.Sugar().Errorf("%s: Something went wrong while inserting to db", postRecipeUsageErrMsg)
		return
	}

	response := map[string]string{
		"status": "successfully added recipe usage to db",
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		s.ErrorResponse(w, r, err.Error(), http.StatusInternalServerError)
	}

	s.logger.Info("Successfully saved recipe usage")
}
