$(document).ready(function () {
    // Place JavaScript code here...
    console.log("Javascript ready");
    bindAddAssignmentForm();
    bindAllDueCheckbox();
});
function bindAddAssignmentForm() {
    if ($("#addAssignment")) {
        $("#addAssignment").on("submit", (event) => {
            console.log("on submit");
            const dueDateStr = $("input[name=dueDate]").val();
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
function bindAllDueCheckbox() {
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
        $("#dueOnly").change(() => {
            console.log("Checkbox change");
            $(".pastDue").toggle();
            // if ($(this.checked)) {
            //     $(".pastDue").hide();
            // } else {
            //     $(".pastDue").show();
            // }
        });
    }
}
//# sourceMappingURL=main.js.map