#!/usr/bin/env python3
"""Initialize MySQL database from schema.sql"""
import mysql.connector
from mysql.connector import Error

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Akash@123"
    )
    
    cursor = conn.cursor()
    
    # Read and execute schema
    with open("database/schema.sql", "r") as f:
        schema = f.read()
    
    # Split by semicolon and execute each statement
    for statement in schema.split(";"):
        if statement.strip():
            cursor.execute(statement)
    
    conn.commit()
    print("✅ Database initialized successfully!")
    
except Error as e:
    print(f"❌ Error: {e}")
finally:
    if conn.is_connected():
        cursor.close()
        conn.close()
