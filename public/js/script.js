$(document).ready(function() {
    $(".progress").hide()
    $('[name="submitButton"]').click(function() {
        $(".progress").show()
        $("#requirementsTable").find("tr:gt(0)").remove();

        var usernameText = $('[name="username"]').val()

        $.post("/user", {
            username: usernameText
        }).done(function(user) {
            $.post("/scrape", {
                    username: usernameText,
                    completedQuests: user.quests
                })
                .done(function(response) {
                    for (var i in response) {
                        var requirementsString = ""
                        var quest = response[i]
                        for (var j in quest.requirements) {
                            var requirement = quest.requirements[j]
                            requirementsString += requirement.skill + " : " + requirement.level + " "
                        }
                        $("#requirementsTable > tbody").append("<tr id="+ quest._id +"><td>" + quest.name + "</td><td>" + requirementsString + "</td><td><a class=\"waves-effect waves-light btn\" id=\"doneQuestButton-" + quest._id + "\"><i class=\"material-icons\">thumb_up</i></a></td></tr>")
                        $('#doneQuestButton-' + quest._id).click({
                            id: quest._id
                        }, function(event) {
                            $("#"+event.data.id).remove()
                            $.post("/saveQuest", {
                                username: usernameText,
                                _id: event.data.id
                            }).done(function(response) {
                            })

                        })
                    }
                    $(".progress").hide()
                }).fail(function() {
                    console.error("error");
                })
        }).fail(function(){
            console.log("user error");
        })

    })
});
