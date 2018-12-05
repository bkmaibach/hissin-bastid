$(document).ready(function() {
    // Place JavaScript code here...
    console.log("Javascript ready");
    bindAddAssignmentSubmit();
    bindAllDueCheckbox();
});

function bindAddAssignmentSubmit(): void {
    if ($("#addAssignment")) {
        console.log("in bindAddAssignmentSubmit");
        $("#addAssignment").on("submit", (event: Event) => {
            const dueDateStr = <string>$("input[name=dueDate]").val();
            const dueDate = new Date(dueDateStr);
            const now = new Date();
            const pastDue = dueDate < now;
            if (pastDue) {
                event.preventDefault();
                alert("Please select a future date");
            }
        });
    }
}

function bindAllDueCheckbox(): void {
    if ($("#dueOnly")) {
        console.log("in bindAllDueCheckbox");
        const now = new Date();
        const pastDueRows = $(".assignmentRow").toArray();
        pastDueRows.forEach((row) => {
            const dueDateStr = row.getElementsByClassName("dueDate")[0].innerHTML;
            const dueDate = new Date(dueDateStr);
            if (now > dueDate) {
                row.classList.add("pastDue");
            }
        });
        // The callback only toggles the elements marked in the code directly above
        $("#dueOnly").change(() => {
            console.log("Checkbox change");
            $(".pastDue").toggle();
        });
    }
}