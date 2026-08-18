const API_URL =
    "https://script.google.com/macros/s/AKfycbxer2kl8VqDKe2Y4WEAh9omokaBO7FysoHOtkFapufFdi0ZkkyT9QfXwV-d74OXN-Tm-w/exec";

const ROLE = "MENTOR";

let allData = [];
let filteredData = [];


// ============================================================
// LOAD DATA
// ============================================================

async function loadData() {

    showLoading(true);
    hideError();

    try {

        const response = await fetch(API_URL, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                "Unable to connect to Google Apps Script."
            );
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(
                result.error || "API error"
            );
        }

        allData = Array.isArray(result.data)
            ? result.data
            : [];

        populateProgramFilter();
        populateBatchFilter();
        populateCurrentTermFilter();

        applyFilters();

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

        showError(
            "Unable to load dashboard data. " +
            error.message
        );

    } finally {

        showLoading(false);
    }
}


// ============================================================
// PROGRAM FILTER
// ============================================================

function populateProgramFilter() {

    const select =
        document.getElementById("programFilter");

    if (!select) return;

    const currentValue = select.value;

    const programs = [
        ...new Set(
            allData
                .map(row =>
                    String(
                        row["Program"] || ""
                    ).trim()
                )
                .filter(Boolean)
        )
    ].sort();

    select.innerHTML =
        '<option value="All">All Programs</option>';

    programs.forEach(program => {

        const option =
            document.createElement("option");

        option.value = program;
        option.textContent = program;

        select.appendChild(option);

    });

    if (programs.includes(currentValue)) {
        select.value = currentValue;
    }
}


// ============================================================
// BATCH FILTER
// ============================================================

function populateBatchFilter() {

    const select =
        document.getElementById("batchFilter");

    if (!select) return;

    const currentValue = select.value;

    const batches = [
        ...new Set(
            allData
                .map(row =>
                    String(
                        row["Batch"] || ""
                    ).trim()
                )
                .filter(Boolean)
        )
    ];

    // Natural sorting:
    // Batch 1, Batch 2, Batch 3, Batch 10...
    batches.sort((a, b) => {

        const numberA =
            parseInt(
                a.replace(/\D/g, ""),
                10
            );

        const numberB =
            parseInt(
                b.replace(/\D/g, ""),
                10
            );

        if (
            !isNaN(numberA) &&
            !isNaN(numberB)
        ) {

            return numberA - numberB;
        }

        return a.localeCompare(b);
    });

    select.innerHTML =
        '<option value="All">All Batches</option>';

    batches.forEach(batch => {

        const option =
            document.createElement("option");

        option.value = batch;
        option.textContent = batch;

        select.appendChild(option);

    });

    if (batches.includes(currentValue)) {
        select.value = currentValue;
    }
}


// ============================================================
// CURRENT TERM FILTER
// ============================================================

function populateCurrentTermFilter() {

    const select =
        document.getElementById(
            "currentTermFilter"
        );

    if (!select) return;

    const currentValue = select.value;

    const values = [
        ...new Set(
            allData
                .map(row =>
                    normalizeCurrentTerm(
                        row["Current Term"]
                    )
                )
                .filter(Boolean)
        )
    ];

    select.innerHTML =
        '<option value="All">All Current Term</option>';

    values.forEach(value => {

        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);

    });

    if (values.includes(currentValue)) {
        select.value = currentValue;
    }
}


// ============================================================
// NORMALIZE CURRENT TERM
// ============================================================

function normalizeCurrentTerm(value) {

    const text =
        String(value ?? "")
            .trim()
            .toLowerCase();

    if (
        text === "true" ||
        text === "1" ||
        text === "yes"
    ) {

        return "True";
    }

    if (
        text === "false" ||
        text === "0" ||
        text === "no"
    ) {

        return "False";
    }

    return String(value ?? "").trim();
}


// ============================================================
// FILTER DATA
// ============================================================

function applyFilters() {

    const searchElement =
        document.getElementById(
            "searchInput"
        );

    const programElement =
        document.getElementById(
            "programFilter"
        );

    const trackElement =
        document.getElementById(
            "trackFilter"
        );

    const batchElement =
        document.getElementById(
            "batchFilter"
        );

    const currentTermElement =
        document.getElementById(
            "currentTermFilter"
        );


    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";


    const program =
        programElement
            ? programElement.value
            : "All";


    const track =
        trackElement
            ? trackElement.value
            : "All";


    const batch =
        batchElement
            ? batchElement.value
            : "All";


    const currentTerm =
        currentTermElement
            ? currentTermElement.value
            : "All";


    filteredData =
        allData.filter(row => {


            // ------------------------------------------------
            // PROGRAM
            // ------------------------------------------------

            const rowProgram =
                String(
                    row["Program"] || ""
                ).trim();


            const programMatch =
                program === "All" ||
                rowProgram === program;


            // ------------------------------------------------
            // TRACK
            // ------------------------------------------------

            const rowTrack =
                String(
                    row["Track"] || ""
                ).trim();


            const trackMatch =
                track === "All" ||
                rowTrack === track;


            // ------------------------------------------------
            // BATCH
            // ------------------------------------------------

            const rowBatch =
                String(
                    row["Batch"] || ""
                ).trim();


            const batchMatch =
                batch === "All" ||
                rowBatch === batch;


            // ------------------------------------------------
            // CURRENT TERM
            // ------------------------------------------------

            const rowCurrentTerm =
                normalizeCurrentTerm(
                    row["Current Term"]
                );


            const currentTermMatch =
                currentTerm === "All" ||
                rowCurrentTerm === currentTerm;


            // ------------------------------------------------
            // ROLL NUMBER
            // ------------------------------------------------

            const rollNo =
                String(
                    row["Roll No"] ||
                    row["Roll no"] ||
                    row["Roll"] ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            // ------------------------------------------------
            // EMAIL
            //
            // Email is NOT displayed in the table,
            // but is still searchable.
            // ------------------------------------------------

            const email =
                String(
                    row["Email"] || ""
                )
                    .trim()
                    .toLowerCase();


            // ------------------------------------------------
            // SEARCH
            // ------------------------------------------------

            const searchMatch =
                search === "" ||
                rollNo.includes(search) ||
                email.includes(search);


            return (
                programMatch &&
                trackMatch &&
                batchMatch &&
                currentTermMatch &&
                searchMatch
            );

        });


    updateDashboard();
}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard() {

    updateCards();

    updateProgress();

    updateTable();
}


// ============================================================
// KPI CARDS
// ============================================================

function updateCards() {

    const total =
        filteredData.length;


    const track1 =
        filteredData.filter(row =>
            String(
                row["Track"] || ""
            ).trim() === "Track 1"
        ).length;


    const track2 =
        filteredData.filter(row =>
            String(
                row["Track"] || ""
            ).trim() === "Track 2"
        ).length;


    const completed =
        filteredData.filter(row => {

            return (
                getOverallPercentage(row)
                >= 100
            );

        }).length;


    const average =
        total === 0

            ? 0

            : Math.round(

                filteredData.reduce(
                    (sum, row) => {

                        return (
                            sum +
                            getOverallPercentage(
                                row
                            )
                        );

                    },
                    0
                ) / total
            );


    setText(
        "totalLearners",
        formatNumber(total)
    );


    setText(
        "track1Count",
        formatNumber(track1)
    );


    setText(
        "track2Count",
        formatNumber(track2)
    );


    setText(
        "completedCount",
        formatNumber(completed)
    );


    setText(
        "averageCompletion",
        average + "%"
    );
}


// ============================================================
// GET OVERALL PERCENTAGE
// ============================================================

function getOverallPercentage(row) {

    let value =
        row["Overall %"];


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        value =
            row["Overall"];
    }


    if (
        typeof value === "string"
    ) {

        value =
            value
                .replace("%", "")
                .trim();
    }


    const number =
        Number(value);


    return isNaN(number)
        ? 0
        : number;
}


// ============================================================
// STEP PROGRESS
// ============================================================

function updateProgress() {

    const steps = [
        "Step 1",
        "Step 2",
        "Step 3",
        "Step 4",
        "Step 5"
    ];


    steps.forEach(
        (step, index) => {

            if (
                filteredData.length === 0
            ) {

                setProgress(
                    index + 1,
                    0
                );

                return;
            }


            const completed =
                filteredData.filter(
                    row =>

                        String(
                            row[step] || ""
                        )
                            .trim()
                            .toLowerCase()
                            === "completed"

                ).length;


            const percent =
                Math.round(

                    (
                        completed /
                        filteredData.length
                    ) * 100

                );


            setProgress(
                index + 1,
                percent
            );

        }
    );
}


// ============================================================
// SET PROGRESS
// ============================================================

function setProgress(
    step,
    percent
) {

    const percentElement =
        document.getElementById(
            `step${step}Percent`
        );


    const barElement =
        document.getElementById(
            `step${step}Bar`
        );


    if (percentElement) {

        percentElement.textContent =
            percent + "%";
    }


    if (barElement) {

        barElement.style.width =
            percent + "%";
    }
}


// ============================================================
// TABLE
//
// IMPORTANT:
// Email is intentionally NOT displayed.
// Search still supports Email.
// ============================================================

function updateTable() {

    const tbody =
        document.getElementById(
            "tableBody"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    if (
        filteredData.length === 0
    ) {

        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td
                colspan="12"
                style="
                    text-align:center;
                    padding:30px;
                    color:#6b7280;
                "
            >
                No learners found
            </td>

        `;


        tbody.appendChild(tr);


        setText(
            "resultCount",
            "0 learners"
        );


        return;
    }


    filteredData.forEach(row => {

        const tr =
            document.createElement("tr");


        // ----------------------------------------------------
        // ROLL NUMBER
        // ----------------------------------------------------

        const rollNo =
            row["Roll No"] ||
            row["Roll no"] ||
            row["Roll"] ||
            "";


        // ----------------------------------------------------
        // PROGRAM
        // ----------------------------------------------------

        const program =
            row["Program"] || "";


        // ----------------------------------------------------
        // TRACK
        // ----------------------------------------------------

        const track =
            row["Track"] || "";


        // ----------------------------------------------------
        // BATCH
        // ----------------------------------------------------

        const batch =
            row["Batch"] || "";


        // ----------------------------------------------------
        // CURRENT TERM
        // ----------------------------------------------------

        const currentTerm =
            normalizeCurrentTerm(
                row["Current Term"]
            );


        // ----------------------------------------------------
        // EVALUATION STATUS
        // ----------------------------------------------------

        const evaluationStatus =
            row["Evaluation Status"] || "";


        // ----------------------------------------------------
        // OVERALL
        // ----------------------------------------------------

        const overall =
            getOverallPercentage(row);


        // ====================================================
        // TABLE ORDER
        //
        // Roll No
        // Program
        // Track
        // Batch
        // Current Term
        // Step 1
        // Step 2
        // Step 3
        // Step 4
        // Step 5
        // Evaluation Status
        // Overall
        // ====================================================

        tr.innerHTML = `

            <!-- Roll No -->

            <td class="roll-no">
                ${escapeHTML(rollNo)}
            </td>


            <!-- Program -->

            <td>
                ${escapeHTML(program)}
            </td>


            <!-- Track -->

            <td>
                ${escapeHTML(track)}
            </td>


            <!-- Batch -->

            <td>
                ${escapeHTML(batch)}
            </td>


            <!-- Current Term -->

            <td>
                ${currentTermCell(currentTerm)}
            </td>


            <!-- Step 1 -->

            ${statusCell(
                row["Step 1"]
            )}


            <!-- Step 2 -->

            ${statusCell(
                row["Step 2"]
            )}


            <!-- Step 3 -->

            ${statusCell(
                row["Step 3"]
            )}


            <!-- Step 4 -->

            ${statusCell(
                row["Step 4"]
            )}


            <!-- Step 5 -->

            ${statusCell(
                row["Step 5"]
            )}


            <!-- Evaluation Status -->

            <td>
                ${evaluationStatusCell(
                    evaluationStatus
                )}
            </td>


            <!-- Overall -->

            <td class="overall">
                ${escapeHTML(overall)}%
            </td>

        `;


        tbody.appendChild(tr);

    });


    setText(
        "resultCount",
        formatNumber(
            filteredData.length
        ) + " learners"
    );
}


// ============================================================
// CURRENT TERM CELL
// ============================================================

function currentTermCell(value) {

    const term =
        String(
            value || ""
        ).trim();


    if (!term) {

        return `
            <span class="status na">
                N/A
            </span>
        `;
    }


    if (
        term.toLowerCase() === "true"
    ) {

        return `
            <span class="status completed">
                True
            </span>
        `;
    }


    if (
        term.toLowerCase() === "false"
    ) {

        return `
            <span class="status pending">
                False
            </span>
        `;
    }


    return `
        <span class="status na">
            ${escapeHTML(term)}
        </span>
    `;
}


// ============================================================
// STEP STATUS CELL
// ============================================================

function statusCell(value) {

    const status =
        String(
            value || ""
        ).trim();


    const lower =
        status.toLowerCase();


    let className =
        "na";


    if (
        lower === "completed"
    ) {

        className =
            "completed";

    } else if (
        lower === "pending"
    ) {

        className =
            "pending";

    } else if (
        lower === "n/a"
    ) {

        className =
            "na";
    }


    return `

        <td>

            <span
                class="status ${className}"
            >
                ${escapeHTML(
                    status || "N/A"
                )}
            </span>

        </td>

    `;
}


// ============================================================
// EVALUATION STATUS CELL
// ============================================================

function evaluationStatusCell(value) {

    const status =
        String(
            value || ""
        ).trim();


    if (!status) {

        return `
            <span class="status na">
                N/A
            </span>
        `;
    }


    const lower =
        status.toLowerCase();


    let className =
        "pending";


    if (
        lower === "evaluated"
    ) {

        className =
            "completed";

    } else if (
        lower === "new submission" ||
        lower === "resubmission"
    ) {

        className =
            "pending";

    } else if (
        lower === "no submission"
    ) {

        className =
            "pending";
    }


    return `

        <span
            class="status ${className}"
        >
            ${escapeHTML(status)}
        </span>

    `;
}


// ============================================================
// DOWNLOAD
//
// Mentor does NOT have download access.
// ============================================================

function downloadCSV(
    data,
    filename
) {

    if (!data.length) {

        alert(
            "No data available to download."
        );

        return;
    }


    const headers =
        Object.keys(data[0]);


    const rows = [

        headers,

        ...data.map(
            row =>
                headers.map(
                    header =>
                        row[header] ?? ""
                )
        )

    ];


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            value =>
                                csvEscape(value)
                        )
                        .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = filename;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


// ============================================================
// CSV ESCAPE
// ============================================================

function csvEscape(value) {

    const text =
        String(
            value ?? ""
        );


    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {

        return (
            '"' +
            text.replace(
                /"/g,
                '""'
            ) +
            '"'
        );
    }


    return text;
}


// ============================================================
// DOWNLOAD BUTTON SETUP
//
// Mentor = hidden
// ============================================================

function setupDownloadButtons() {

    const downloadSection =
        document.querySelector(
            ".download-section"
        );


    if (
        ROLE === "MENTOR"
    ) {

        if (downloadSection) {

            downloadSection.style.display =
                "none";
        }

        return;
    }
}


// ============================================================
// FILTER EVENTS
// ============================================================

function setupFilterEvents() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const programFilter =
        document.getElementById(
            "programFilter"
        );


    const trackFilter =
        document.getElementById(
            "trackFilter"
        );


    const batchFilter =
        document.getElementById(
            "batchFilter"
        );


    const currentTermFilter =
        document.getElementById(
            "currentTermFilter"
        );


    const clearBtn =
        document.getElementById(
            "clearBtn"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );
    }


    if (programFilter) {

        programFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    if (trackFilter) {

        trackFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    if (batchFilter) {

        batchFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    if (currentTermFilter) {

        currentTermFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            () => {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (programFilter) {
                    programFilter.value = "All";
                }

                if (trackFilter) {
                    trackFilter.value = "All";
                }

                if (batchFilter) {
                    batchFilter.value = "All";
                }

                if (currentTermFilter) {
                    currentTermFilter.value = "All";
                }

                applyFilters();

            }
        );
    }
}


// ============================================================
// FORMAT NUMBER
// ============================================================

function formatNumber(number) {

    return Number(number)
        .toLocaleString("en-IN");
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================================
// SET TEXT
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;
    }
}


// ============================================================
// LOADING
// ============================================================

function showLoading(show) {

    const element =
        document.getElementById(
            "loading"
        );


    if (element) {

        element.style.display =
            show
                ? "flex"
                : "none";
    }
}


// ============================================================
// ERROR
// ============================================================

function showError(message) {

    const element =
        document.getElementById(
            "error"
        );


    if (!element) return;


    element.textContent =
        message;


    element.style.display =
        "block";
}


// ============================================================
// HIDE ERROR
// ============================================================

function hideError() {

    const element =
        document.getElementById(
            "error"
        );


    if (element) {

        element.style.display =
            "none";
    }
}


// ============================================================
// INITIALIZE
// ============================================================

setupFilterEvents();

setupDownloadButtons();

loadData();


// ============================================================
// AUTO REFRESH
// EVERY 5 MINUTES
// ============================================================

setInterval(
    () => {

        loadData();

    },
    5 * 60 * 1000
);
