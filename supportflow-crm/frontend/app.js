const API_URL = "https://supportflow-crm.onrender.com/api/tickets";

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


// TOAST CENTER
function showToast(message) {

    const toast =
        document.createElement("div");

    toast.className =
        `
        fixed 
        top-6 
        left-1/2 
        -translate-x-1/2 
        bg-green-500 
        text-white 
        px-6 
        py-3 
        rounded-xl 
        shadow-2xl 
        z-50 
        text-sm 
        font-semibold
        animate-bounce
        `;

    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform =
            "translateX(-50%) translateY(-10px)";

        toast.style.transition =
            "all 0.4s ease";

    }, 1800);

    setTimeout(() => {

        toast.remove();

    }, 2300);
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

        console.error(error);
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


    // EMPTY STATE
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
            `
            border-t 
            border-gray-800 
            hover:bg-[#1B2435]
            transition-all 
            duration-300 
            cursor-pointer
            hover:scale-[1.005]
            `;

        row.innerHTML = `
        
            <td class="p-3 font-semibold text-sm">
                ${ticket.ticket_id}
            </td>

            <td class="p-3 text-sm">
                ${ticket.customer_name}
            </td>

            <td class="p-3 text-sm">
                ${ticket.subject}
            </td>

            <td class="p-3">

                <span
                    class="
                    px-3 
                    py-1 
                    rounded-full 
                    text-xs 
                    font-medium
                    ${getPriorityClass(ticket.priority)}
                    ">

                    ${ticket.priority}

                </span>

            </td>

            <td class="p-3">

                <select
                    onclick="event.stopPropagation()"
                    onchange="updateTicketStatus('${ticket.ticket_id}', this.value)"
                    class="
                    bg-[#1F2937] 
                    border 
                    border-gray-700 
                    rounded-lg 
                    px-3 
                    py-2 
                    text-xs 
                    outline-none
                    hover:border-blue-500
                    transition
                    ">

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
            
                <div class="
                    bg-gray-800 
                    p-3 
                    rounded-xl 
                    mb-3 
                    text-sm
                    border border-gray-700
                    ">

                    ${note.text}

                </div>
            `;
        });

    } else {

        notesHTML =
            `
            <p class="text-gray-400 text-sm">
                No notes available
            </p>
            `;
    }

    const modal =
        document.createElement("div");

    modal.className =
        `
        fixed 
        inset-0 
        bg-black/70 
        flex 
        justify-center 
        items-center 
        z-50 
        p-4
        `;

    modal.innerHTML = `
    
        <div class="
            bg-[#111827] 
            w-full 
            max-w-xl 
            rounded-2xl 
            p-6 
            border 
            border-gray-800 
            overflow-y-auto 
            max-h-[90vh]
            shadow-2xl
            animate-in
            ">

            <div class="flex justify-between items-center mb-5">

                <h2 class="text-2xl font-bold">

                    ${ticket.ticket_id}

                </h2>

                <button
                    onclick="this.parentElement.parentElement.parentElement.remove()"
                    class="
                    text-xl 
                    text-gray-400 
                    hover:text-white
                    transition
                    ">

                    ✕

                </button>

            </div>

            <div class="space-y-4">

                <div>

                    <p class="text-gray-400 text-sm mb-1">
                        Customer
                    </p>

                    <p class="font-semibold">
                        ${ticket.customer_name}
                    </p>

                </div>

                <div>

                    <p class="text-gray-400 text-sm mb-1">
                        Email
                    </p>

                    <p>
                        ${ticket.customer_email}
                    </p>

                </div>

                <div>

                    <p class="text-gray-400 text-sm mb-1">
                        Subject
                    </p>

                    <p>
                        ${ticket.subject}
                    </p>

                </div>

                <div>

                    <p class="text-gray-400 text-sm mb-1">
                        Description
                    </p>

                    <p class="leading-7">
                        ${ticket.description}
                    </p>

                </div>

                <div>

                    <p class="text-gray-400 text-sm mb-2">
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
            "Ticket Updated Successfully"
        );

        await fetchTickets(
            searchInput.value,
            statusFilter.value
        );

    } catch (error) {

        console.error(error);
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


    if (statusChart)
        statusChart.destroy();

    if (priorityChart)
        priorityChart.destroy();


    // DOUGHNUT
    statusChart = new Chart(

        document.getElementById(
            "statusChart"
        ),

        {

            type: "doughnut",

            data: {

                labels: [
                    "Open",
                    "Progress",
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

                    borderWidth: 2
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "70%",

                plugins: {

                    legend: {

                        labels: {

                            color: "white",

                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        }
    );


    // BAR
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

                    borderRadius: 8,

                    maxBarThickness: 35
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

                            color: "white",

                            font: {
                                size: 10
                            }
                        },

                        grid: {
                            color: "#374151"
                        }
                    },

                    x: {

                        ticks: {

                            color: "white",

                            font: {
                                size: 10
                            }
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
                "Ticket Created Successfully"
            );

            await fetchTickets();

        } catch (error) {

            console.error(error);
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