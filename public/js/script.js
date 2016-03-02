$(document).ready(function() {
    $('[name="submitButton"]').click(function() {

        $("#requirementsTable").find("tr:gt(0)").remove();

        var usernameText = $('[name="username"]').val()

        $.post("/scrape", {
                username: usernameText
            })
            .done(function(response) {
                for (var i in response) {
                    var requirementsString = ""
                    for (var j in response[i].requirements) {
                        requirementsString += response[i].requirements[j].skill + " : " + response[i].requirements[j].level + " "
                    }
                    $("#requirementsTable > tbody").append("<tr><td>" + response[i].name + "</td><td>" + requirementsString + "</td></tr>")
                }
            }).fail(function() {
                console.error("error");
            })
    })
});
