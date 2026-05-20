const API_URL = "http://127.0.0.1:8000/api/tickets";

let statusChart;
let priorityChart;

const ticketTableBody =
    document.getElementById("ticketTableBody");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const ticketModal =
    document.getElementById("ticketModal");

const openModalBtn =
    document.getElementById("openModalBtn");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const ticketForm =
    document.getElementById("ticketForm");


// TOAST
function showToast(message) {

    const toast =
        document.createElement("div");

    toast.className =
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-8 py-5 rounded-2xl shadow-2xl z-50 text-lg font-semibold";

    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 2500);
}


// OPEN MODAL
openModalBtn.addEventListener(
    "click",
    () => {

        ticketModal.classList.remove(
            "hidden"
        );

        ticketModal.classList.add(
            "flex"
        );
    }
);


// CLOSE MODAL
closeModalBtn.addEventListener(
    "click",
    () => {

        ticketModal.classList.add(
            "hidden"
        );

        ticketModal.classList.remove(
            "flex"
        );
    }
);


// FETCH TICKETS
async function fetchTickets(
    search = "",
    status = ""
) {

    try {

        let url = API_URL;

        const queryParams = [];

        if (search) {

            queryParams.push(
                `search=${search}`
            );
        }

        if (
            status &&
            status !== "All Status"
        ) {

            queryParams.push(
                `status=${status}`
            );
        }

        if (
            queryParams.length > 0
        ) {

            url +=
                `?${queryParams.join("&")}`;
        }

        const response =
            await fetch(url);

        const tickets =
            await response.json();

        renderTickets(tickets);

    } catch (error) {

        console.error(
            "Error fetching tickets:",
            error
        );
    }
}


// RENDER TICKETS
function renderTickets(tickets) {

    ticketTableBody.innerHTML = "";


    // STATS
    document.getElementById(
        "totalTickets"
    ).innerText =
        tickets.length;

    document.getElementById(
        "openTickets"
    ).innerText =
        tickets.filter(
            t => t.status === "Open"
        ).length;

    document.getElementById(
        "progressTickets"
    ).innerText =
        tickets.filter(
            t => t.status === "In Progress"
        ).length;

    document.getElementById(
        "closedTickets"
    ).innerText =
        tickets.filter(
            t => t.status === "Closed"
        ).length;


    // EMPTY
    if (tickets.length === 0) {

        ticketTableBody.innerHTML = `
        
            <tr>

                <td colspan="5"
                    class="p-10 text-center text-gray-400">

                    No tickets found

                </td>

            </tr>
        `;

        renderCharts([]);

        return;
    }


    // TABLE
    tickets.forEach(ticket => {

        const row =
            document.createElement("tr");

        row.className =
            "border-t border-gray-800 hover:bg-gray-800 transition cursor-pointer";

        row.innerHTML = `
        
            <td class="p-6 font-semibold">
                ${ticket.ticket_id}
            </td>

            <td class="p-6">
                ${ticket.customer_name}
            </td>

            <td class="p-6">
                ${ticket.subject}
            </td>

            <td class="p-6">

                <span
                    class="px-3 py-1 rounded-full text-sm font-medium
                    ${getPriorityClass(ticket.priority)}">

                    ${ticket.priority}

                </span>

            </td>

            <td class="p-6">

                <select
                    onclick="event.stopPropagation()"
                    onchange="updateTicketStatus('${ticket.ticket_id}', this.value)"
                    class="bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-2 text-sm outline-none">

                    <option value="Open"
                        ${ticket.status === "Open"
                            ? "selected"
                            : ""}>

                        Open

                    </option>

                    <option value="In Progress"
                        ${ticket.status === "In Progress"
                            ? "selected"
                            : ""}>

                        In Progress

                    </option>

                    <option value="Closed"
                        ${ticket.status === "Closed"
                            ? "selected"
                            : ""}>

                        Closed

                    </option>

                </select>

            </td>
        `;

        row.addEventListener(
            "click",
            () => showTicketDetails(ticket)
        );

        ticketTableBody.appendChild(
            row
        );
    });

    renderCharts(tickets);
}


// DETAILS MODAL
function showTicketDetails(ticket) {

    let notesHTML = "";

    if (
        ticket.notes &&
        ticket.notes.length > 0
    ) {

        ticket.notes.forEach(note => {

            notesHTML += `
            
                <div class="bg-gray-800 p-4 rounded-xl mb-3">

                    ${note.text}

                </div>
            `;
        });

    } else {

        notesHTML =
            `<p class="text-gray-400">
                No notes available
            </p>`;
    }

    const modal =
        document.createElement("div");

    modal.className =
        "fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4";

    modal.innerHTML = `
    
        <div class="bg-[#111827] w-full max-w-2xl rounded-3xl p-8 border border-gray-800 overflow-y-auto max-h-[90vh]">

            <div class="flex justify-between items-center mb-6">

                <h2 class="text-3xl font-bold">

                    ${ticket.ticket_id}

                </h2>

                <button
                    onclick="this.parentElement.parentElement.parentElement.remove()"
                    class="text-2xl text-gray-400 hover:text-white">

                    ✕

                </button>

            </div>

            <div class="space-y-5">

                <div>

                    <p class="text-gray-400 mb-1">
                        Customer
                    </p>

                    <p class="text-lg font-semibold">
                        ${ticket.customer_name}
                    </p>

                </div>

                <div>

                    <p class="text-gray-400 mb-1">
                        Email
                    </p>

                    <p class="text-lg">
                        ${ticket.customer_email}
                    </p>

                </div>

                <div>

                    <p class="text-gray-400 mb-1">
                        Subject
                    </p>

                    <p class="text-lg">
                        ${ticket.subject}
                    </p>

                </div>

                <div>

                    <p class="text-gray-400 mb-1">
                        Description
                    </p>

                    <p class="text-lg">
                        ${ticket.description}
                    </p>

                </div>

                <div>

                    <p class="text-gray-400 mb-2">
                        Status
                    </p>

                    <p class="text-lg font-semibold">
                        ${ticket.status}
                    </p>

                </div>

                <div>

                    <p class="text-gray-400 mb-3">
                        Notes
                    </p>

                    ${notesHTML}

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}


// UPDATE STATUS
async function updateTicketStatus(
    ticketId,
    status
) {

    try {

        await fetch(
            `${API_URL}/${ticketId}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );

        showToast(
            "Ticket Updated Successfully!"
        );

        // LIVE REFRESH
        await fetchTickets(
            searchInput.value,
            statusFilter.value
        );

    } catch (error) {

        console.error(
            "Error updating ticket:",
            error
        );
    }
}


// PRIORITY COLORS
function getPriorityClass(priority) {

    switch (priority) {

        case "High":
            return "bg-red-500/20 text-red-400";

        case "Medium":
            return "bg-yellow-500/20 text-yellow-400";

        case "Low":
            return "bg-green-500/20 text-green-400";

        default:
            return "bg-gray-500/20 text-gray-400";
    }
}


// CHARTS
function renderCharts(tickets) {

    const openCount =
        tickets.filter(
            t => t.status === "Open"
        ).length;

    const progressCount =
        tickets.filter(
            t => t.status === "In Progress"
        ).length;

    const closedCount =
        tickets.filter(
            t => t.status === "Closed"
        ).length;


    const highPriority =
        tickets.filter(
            t => t.priority === "High"
        ).length;

    const mediumPriority =
        tickets.filter(
            t => t.priority === "Medium"
        ).length;

    const lowPriority =
        tickets.filter(
            t => t.priority === "Low"
        ).length;


    // DESTROY OLD
    if (statusChart)
        statusChart.destroy();

    if (priorityChart)
        priorityChart.destroy();


    // STATUS CHART
    statusChart = new Chart(

        document.getElementById(
            "statusChart"
        ),

        {

            type: "doughnut",

            data: {

                labels: [
                    "Open",
                    "In Progress",
                    "Closed"
                ],

                datasets: [{

                    data: [
                        openCount,
                        progressCount,
                        closedCount
                    ],

                    backgroundColor: [
                        "#facc15",
                        "#3b82f6",
                        "#22c55e"
                    ],

                    borderColor: "#111827",

                    borderWidth: 3,

                    hoverOffset: 12
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "65%",

                plugins: {

                    legend: {

                        position: "top",

                        labels: {

                            color: "white",

                            padding: 20,

                            font: {
                                size: 13,
                                weight: "600"
                            }
                        }
                    }
                }
            }
        }
    );


    // PRIORITY CHART
    priorityChart = new Chart(

        document.getElementById(
            "priorityChart"
        ),

        {

            type: "bar",

            data: {

                labels: [
                    "High",
                    "Medium",
                    "Low"
                ],

                datasets: [{

                    label: "Tickets",

                    data: [
                        highPriority,
                        mediumPriority,
                        lowPriority
                    ],

                    backgroundColor: [
                        "#ef4444",
                        "#facc15",
                        "#22c55e"
                    ],

                    borderRadius: 12,

                    maxBarThickness: 80
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }
                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {
                            color: "white"
                        },

                        grid: {
                            color: "#374151"
                        }
                    },

                    x: {

                        ticks: {
                            color: "white"
                        },

                        grid: {
                            display: false
                        }
                    }
                }
            }
        }
    );
}


// CREATE TICKET
ticketForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const ticketData = {

            customer_name:
                document.getElementById(
                    "customerName"
                ).value,

            customer_email:
                document.getElementById(
                    "customerEmail"
                ).value,

            subject:
                document.getElementById(
                    "subject"
                ).value,

            description:
                document.getElementById(
                    "description"
                ).value,

            priority:
                document.getElementById(
                    "priority"
                ).value
        };

        try {

            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        ticketData
                    )
                }
            );

            ticketModal.classList.add(
                "hidden"
            );

            ticketModal.classList.remove(
                "flex"
            );

            ticketForm.reset();

            showToast(
                "Ticket Created Successfully!"
            );

            await fetchTickets();

        } catch (error) {

            console.error(
                "Error creating ticket:",
                error
            );
        }
    }
);


// SEARCH
searchInput.addEventListener(
    "input",
    () => {

        fetchTickets(
            searchInput.value,
            statusFilter.value
        );
    }
);


// FILTER
statusFilter.addEventListener(
    "change",
    () => {

        fetchTickets(
            searchInput.value,
            statusFilter.value
        );
    }
);


// SIDEBAR FILTER
function filterSidebar(status) {

    statusFilter.value = status;

    if (
        status === "All Status"
    ) {

        fetchTickets(
            searchInput.value,
            ""
        );

    } else {

        fetchTickets(
            searchInput.value,
            status
        );
    }
}


// INITIAL LOAD
fetchTickets();