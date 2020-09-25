# ---
# author: Jonathan Gilbert - 1001374490
# language: nim
# dependencies: nim, gcc (or another C compiler), sqlite3_64.dll (or equivalent)
# compile: nim c ./insert.nim
# compilation output: insert.exe (or equivalent)
# usage output: data.db (persistent database object)
# ---

import db_sqlite, os, strutils

proc main() =
  
  # Usage: insert p1 p2 p3 p4 p5
  # Command: insert
  # Parameters: database values, p1 -> p5
  # Inserts database values into data.db database
  
  # Process command line arguments
  let args = commandLineParams()
  var v1, v2, v3, p1, p2: float

  if paramCount() != 5:
    echo "ERROR: INCORRECT USAGE"
    echo  "Usage: insert p1 p2 p3 p4 p5\n",
          "Command: insert\n",
          "Parameters: database values, p1 -> p5\n",
          "Inserts database values into data.db database"
    return
  else:
    v1 = parseFloat(args[0]) 
    v2 = parseFloat(args[1])
    v3 = parseFloat(args[2])
    p1 = parseFloat(args[3])
    p2 = parseFloat(args[4])

  # Open database / Create it it doesn't exist
  let db = open("data.db", "", "", "")

  # Create data table if it doesn't exist (use case: first run)
  db.exec(sql"""
            CREATE TABLE IF NOT EXISTS data(
              voltage1 REAL,
              voltage2 REAL,
              voltage3 REAL,
              position1 REAL,
              position2 REAL
            );
          """)

  # Insert input values
  db.exec(sql"""
            INSERT INTO data (
                voltage1,
                voltage2,
                voltage3,
                position1,
                position2
              )
              VALUES (?,?,?,?,?);
          """, v1, v2, v3, p1, p2)
          
  # Close database
  db.close()

main()
