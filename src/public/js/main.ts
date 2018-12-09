$(document).ready(function() {
    // Place JavaScript code here...
    console.log("Javascript ready");
    bindAddAssignmentSubmit();
    bindAllDueCheckbox();
    bindAllEditButtons();
    bindAllDeleteButtons();
    bindSubmitEditEvent();
    bindAcceptDeleteButton();
    bindCancelEditButton();
    bindCancelDeleteButton();
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
    overlayOff();
    const editButtons = $(".edit-btn");
    if (editButtons) {
        console.log("in bindAllEditButtons");
        editButtons.on("click", function(event) {
            $("#deleteAssignmentContainer").hide();
            $("#editAssignmentContainer").show();
            const assignmentName = $(this).closest(".assignmentRow")[0].querySelector(".name").innerHTML;
            const course = $(this).closest(".assignmentRow")[0].querySelector(".course").innerHTML;
            const dueDateTimeStr = $(this).closest(".assignmentRow")[0].querySelector(".dueDate").innerHTML;
            const url = $(this).closest(".assignmentRow")[0].querySelector(".assignment-url-anchor").getAttribute("href");
            const note = $(this).closest(".assignmentRow")[0].querySelector(".note").innerHTML;

            const dueDateTime = new Date(dueDateTimeStr);
            const dueYear = dueDateTime.getFullYear();
            const dueMonth = dueDateTime.getMonth() > 9 ? dueDateTime.getMonth() : "0" + dueDateTime.getMonth();
            const dueDay = dueDateTime.getDay() > 9 ? dueDateTime.getDay() : "0" + dueDateTime.getDay();

            const dueHours = dueDateTime.getHours() > 9 ? dueDateTime.getHours() : "0" + dueDateTime.getHours();
            const dueMinutes = dueDateTime.getMinutes() > 9 ? dueDateTime.getMinutes() : "0" + dueDateTime.getMinutes();

            const dueDate =  dueYear + "-" + dueMonth + "-" + dueDay;
            const dueTime = dueHours + ":" + dueMinutes;

            console.log(assignmentName);
            console.log(course);
            console.log(dueDate);
            console.log(dueTime);
            console.log(url);
            console.log(note);
            $("#assignmentToEdit").html(assignmentName);
            $("#assignmentName").val(assignmentName);
            $("#course").val(course);
            $("#dueDate").val(dueDate);
            $("#dueTime").val(dueTime);
            $("#url").val(url);
            $("#note").val(note);
            overlayOn();
        });
    }
}

function bindAllDeleteButtons(): void {
    const deleteButtons = $(".delete-btn");
    if (deleteButtons) {
        console.log("in bindAllDeleteButtons");
        deleteButtons.on("click", function(event) {
            $("#editAssignmentContainer").hide();
            $("#deleteAssignmentContainer").show();
            const assignmentName = $(this).closest(".assignmentRow")[0].querySelector(".name").innerHTML;
            $("#assignmentToDelete").html(assignmentName);
            $(".overlay").css("width", "50%");
        });
    }
}

function bindSubmitEditEvent(): void {
    const editForm = $("#editAssignment");
    if (editForm) {
        editForm.submit(function (event) {
            event.preventDefault();
            const toEdit = $("#assignmentToEdit").html();
            console.log("Editing " + toEdit);
            $.ajax({
                url: `/assignments?name=${toEdit}`,
                type: "PUT",
                contentType: "application/x-www-form-urlencoded",
                data: $(this).serialize(),
                success: (result) => {
                    console.log(result);
                    overlayOff();
                    location.reload();
                },
                error: (jqXhr, textStatus, errorThrown) => {
                    alert("Error editing assignment. Are the name and URL unique?");
                    console.log(errorThrown);
                }
            });
        });
    }
}

function bindCancelEditButton(): void {
    const cancelEditButton = $(".cancel-edit-btn");
    if (cancelEditButton) {
        cancelEditButton.on("click", () => {
            overlayOff();
        });
    }
}

function bindAcceptDeleteButton(): void {
    const acceptDeleteButton = $(".accept-delete-btn");
    if (acceptDeleteButton) {
        console.log("in bindAcceptDeleteButton");
        acceptDeleteButton.on("click", () => {
            const toDelete = $("#assignmentToDelete").html();
            console.log("Deleting " + toDelete);
            $.ajax({
                url: `/assignments?name=${toDelete}`,
                type: "DELETE",
                success: (result) => {
                    console.log(result);
                    location.reload();
                }
            });
        });
    }
}

function bindCancelDeleteButton(): void {
    const cancelDeleteButton = $(".cancel-delete-btn");
    if (cancelDeleteButton) {
        cancelDeleteButton.on("click", () => {
            overlayOff();
        });
    }
}

function overlayOff() {
    console.log("overlay OFF");
    $(".overlay").css("width", "0%");
}

function overlayOn() {
    console.log("overlay ON");
    $(".overlay").css("width", "50%");
}