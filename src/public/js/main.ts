$(document).ready(function() {
    // Place JavaScript code here...
    console.log("Javascript ready");
    bindAddAssignmentSubmit();
    bindAllDueCheckbox();
    bindAllEditButtons();
    bindAllDeleteButtons();
    bindAcceptEditButton();
    bindAcceptDeleteButton();
    bindCancelButton();
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

function bindAllEditButtons(): void {
    if ($(".edit-btn")) {
        console.log("in bindAllEditButtons");
        const editButtons = $(".edit-btn");
        editButtons.on("click", function(event) {
            const assignmentName = $(this).closest(".assignmentRow")[0].querySelector(".name").innerHTML;
            const course = $(this).closest(".assignmentRow")[0].querySelector(".course").innerHTML;
            const dueDateTime = $(this).closest(".assignmentRow")[0].querySelector(".dueDate").innerHTML;
            const url = $(this).closest(".assignmentRow")[0].querySelector(".assignment-url-anchor").getAttribute("href");
            const note = $(this).closest(".assignmentRow")[0].querySelector(".note").innerHTML;

            const dateTimeArr = dueDateTime.split(",");
            const dueDate = dateTimeArr[0];
            const dueTime = dateTimeArr[1].trim();
            console.log(assignmentName);
            console.log(course);
            console.log(dueDate);
            console.log(dueTime);
            console.log(url);
            console.log(note);
            $("#assignmentName").val(assignmentName);
            $("#course").val(course);
            $("#dueDate").val(dueDate);
            $("#dueTime").val(dueTime);
            $("#url").val(url);
            $("#note").val(note);
            console.log("overlay ON");
            $(".overlay").css("width", "50%");
        });
    }
}

function bindAllDeleteButtons(): void {
    if ($(".delete-btn")) {

    }
}

function bindAcceptEditButton(): void {
    if ($(".delete-btn")) {

    }
}

function bindAcceptDeleteButton(): void {
    if ($(".delete-btn")) {

    }
}

function bindCancelButton(): void {
    if ($(".cancel-btn")) {
        $(".cancel-btn").on("click", () => {
            overlayOff();
        });
    }
}

function overlayOff() {
    console.log("overlay OFF");
    $(".overlay").css("width", "0%");
}