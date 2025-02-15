package server

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

type DbSchema struct {
	name              string
	recipeUsageTable  DbTable
	builderUsageTable DbTable
	tables            []DbTable
}

type DbTable struct {
	name    string
	columns []DbColumn
}

type DbColumn struct {
	columnName string
	dataType   string
	constraint string
}

func NewDbSchema(name string) DbSchema {
	recipeUsageTable := DbTable{
		name: "recipe_usage",
		columns: []DbColumn{
			{
				columnName: "id",
				dataType:   "integer",
				constraint: "NOT NULL PRIMARY KEY AUTOINCREMENT",
			},
			{
				columnName: "name",
				dataType:   "VARCHAR(255)",
				constraint: "NOT NULL",
			},
			{
				columnName: "used_at",
				dataType:   "DATETIME",
				constraint: "NOT NULL",
			},
		},
	}

	builderUsageTable := DbTable{
		name: "builder_usage",
		columns: []DbColumn{
			{
				columnName: "id",
				dataType:   "integer",
				constraint: "NOT NULL PRIMARY KEY AUTOINCREMENT",
			},
			{
				columnName: "name",
				dataType:   "VARCHAR(255)",
				constraint: "NOT NULL",
			},
			{
				columnName: "used_at",
				dataType:   "DATETIME",
				constraint: "NOT NULL",
			},
		},
	}

	dbs := DbSchema{
		name:              name,
		recipeUsageTable:  recipeUsageTable,
		builderUsageTable: builderUsageTable,
		tables: []DbTable{
			recipeUsageTable,
			builderUsageTable,
		},
	}

	return dbs
}

func setupDatabase(dbName string) (*sql.DB, *DbSchema, error) {
	dbSchema := NewDbSchema(dbName)

	// Open the database (do not defer Close here, so we can return an open DB).
	db, err := sql.Open("sqlite3", "./data/"+dbName)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to open db: %w", err)
	}

	// Check the connection
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, nil, fmt.Errorf("failed to ping db: %w", err)
	}

	// Create the tables if they don't exist
	for _, t := range dbSchema.tables {
		err = createTable(db, t)
		if err != nil {
			db.Close()
			return nil, nil, err
		}
	}

	// Return the open DB so other parts of your application can use it.
	return db, &dbSchema, nil
}

func createTable(db *sql.DB, t DbTable) error {
	sqlStmt := fmt.Sprintf("CREATE TABLE IF NOT EXISTS %s (", t.name)

	for i, c := range t.columns {
		columnDef := fmt.Sprintf("%s %s %s", c.columnName, c.dataType, c.constraint)
		sqlStmt += columnDef
		if i < len(t.columns)-1 {
			sqlStmt += ", "
		}
	}

	sqlStmt += ");"

	_, err := db.Exec(sqlStmt)
	if err != nil {
		return fmt.Errorf("failed to create table %s: %w", t.name, err)
	}

	return nil
}

// Insert into table by building a query from the columns and the `values` string.
//
// Example usage for table recipe_usage (id, name, used_at):
//
//	values := "NULL, 'my-test-recipe', '2025-01-28 14:45:30'"
func insertIntoTable(db *sql.DB, t DbTable, values string) error {
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Build the INSERT statement from columns
	sqlStmt := "INSERT INTO " + t.name + " ("
	for i, c := range t.columns {
		sqlStmt += c.columnName
		if i < len(t.columns)-1 {
			sqlStmt += ", "
		}
	}
	sqlStmt += ") VALUES ("
	sqlStmt += values
	sqlStmt += ");"

	// Execute the statement directly
	_, err = tx.Exec(sqlStmt)
	if err != nil {
		err = tx.Rollback()
		if err != nil {
			return fmt.Errorf("failed to rollback transaction: %w", err)
		}
		return fmt.Errorf("failed to insert row: %w", err)
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
