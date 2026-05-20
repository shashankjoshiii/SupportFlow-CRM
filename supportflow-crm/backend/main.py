from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import tickets_collection
from datetime import datetime
import random
import string

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# HOME
@app.get("/")
def home():

    return {
        "message": "SupportFlow CRM API Running"
    }


# GENERATE TICKET ID
def generate_ticket_id():

    random_part = ''.join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=6
        )
    )

    return f"TKT-{random_part}"


# CREATE TICKET
@app.post("/api/tickets")
def create_ticket(ticket: dict):

    ticket["ticket_id"] = generate_ticket_id()

    ticket["status"] = "Open"

    ticket["notes"] = []

    ticket["created_at"] = datetime.utcnow()

    ticket["updated_at"] = datetime.utcnow()

    tickets_collection.insert_one(ticket)

    return {
        "message": "Ticket created successfully"
    }


# GET ALL TICKETS
@app.get("/api/tickets")
def get_tickets(
    search: str = "",
    status: str = ""
):

    query = {}

    if search:

        query["$or"] = [

            {
                "customer_name": {
                    "$regex": search,
                    "$options": "i"
                }
            },

            {
                "customer_email": {
                    "$regex": search,
                    "$options": "i"
                }
            },

            {
                "subject": {
                    "$regex": search,
                    "$options": "i"
                }
            },

            {
                "description": {
                    "$regex": search,
                    "$options": "i"
                }
            },

            {
                "ticket_id": {
                    "$regex": search,
                    "$options": "i"
                }
            }
        ]

    if status:

        query["status"] = status

    tickets = list(
        tickets_collection.find(
            query,
            {"_id": 0}
        )
    )

    return tickets


# GET SINGLE TICKET
@app.get("/api/tickets/{ticket_id}")
def get_single_ticket(ticket_id: str):

    ticket = tickets_collection.find_one(
        {"ticket_id": ticket_id},
        {"_id": 0}
    )

    return ticket


# UPDATE TICKET
@app.put("/api/tickets/{ticket_id}")
def update_ticket(
    ticket_id: str,
    data: dict
):

    update_data = {
        "status": data["status"],
        "updated_at": datetime.utcnow()
    }

    if "note" in data and data["note"]:

        tickets_collection.update_one(

            {"ticket_id": ticket_id},

            {
                "$push": {
                    "notes": {
                        "text": data["note"],
                        "created_at": datetime.utcnow()
                    }
                },

                "$set": update_data
            }
        )

    else:

        tickets_collection.update_one(

            {"ticket_id": ticket_id},

            {
                "$set": update_data
            }
        )

    return {
        "success": True
    }