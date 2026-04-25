var apiRoot = "https://api.github.com/";

// Theme management
function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

function initTheme() {
    var savedTheme = localStorage.getItem('theme');
    
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setTheme(savedTheme);
    } else {
        // If no saved preference, use system theme
        var systemTheme = detectSystemTheme();
        setTheme(systemTheme);
    }
}

function updateThemeDisplay() {
    var currentTheme = localStorage.getItem('theme') || 'light';
    var themeKey = currentTheme === 'dark' ? 'darkTheme' : 'lightTheme';
    var displayText = i18n.t(themeKey);
    var display = document.getElementById('theme-display');
    if (display) {
        display.textContent = displayText;
    }
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
    updateThemeDisplay();
}

function toggleTheme() {
    var currentTheme = localStorage.getItem('theme') || 'light';
    var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Initialize theme when page loads
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    updateUIText();
});

function updateUIText() {
    document.title = i18n.t('title');
    document.getElementById('page-title').textContent = i18n.t('title');
    document.getElementById('page-description').content = i18n.t('description');
    document.getElementById('page-keywords').content = i18n.t('keywords');
    document.getElementById('navbar-title').textContent = i18n.t('title');
    document.getElementById('lang-display').textContent = i18n.t('language');
    updateThemeDisplay();
    document.getElementById('view-github').textContent = i18n.t('viewOnGithub');
    document.getElementById('enter-details').textContent = i18n.t('enterProjectDetails');
    document.getElementById('get-stats-button').textContent = i18n.t('getStats');
    document.getElementById('desc-text').textContent = i18n.t('statsDescription');
    document.getElementById('get-prev-results-button').textContent = i18n.t('newer');
    document.getElementById('get-next-results-button').textContent = i18n.t('older');
    document.getElementById('per-page-label').textContent = i18n.t('perPage');
    
    document.getElementById('username').placeholder = i18n.t('githubUsername');
    document.getElementById('repository').placeholder = i18n.t('repositoryName');
    
    var titleDesc = document.getElementById('title-description');
    if (titleDesc) {
        titleDesc.textContent = i18n.t('titleDescription');
    }
}

function changeLang(lang) {
    i18n.setLang(lang);
    updateUIText();
    var username = getQueryVariable("username");
    var repository = getQueryVariable("repository");
    if(username != "" && repository != "") {
        var page = getQueryVariable("page") || 1;
        var perPage = getQueryVariable("per_page") || 5;
        getStats(page, perPage);
    }
}

// Return a HTTP query variable
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for(var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable) {
            return pair[1];
        }
    }
    return "";
}

// Format numbers
function formatNumber(value) {
    return value.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')
}

// Validate the user input
function validateInput() {
    if ($("#username").val().length > 0 && $("#repository").val().length > 0) {
        $("#get-stats-button").prop("disabled", false);
    } else {
        $("#get-stats-button").prop("disabled", true);
    }
}

// Move to #repository when hit enter and if it's empty or trigger the button
$("#username").keyup(function (event) {
    if (event.keyCode === 13) {
        if (!$("#repository").val()) {
            $("#repository").focus();
        } else {
            $("#get-stats-button").click();
        }
    }
});

// Callback function for getting user repositories
function getUserRepos() {
    var user = $("#username").val();

    var autoComplete = $('#repository').typeahead({ 
        autoSelect: true,
        afterSelect: function() {
            $("#get-stats-button").click();
        }
     });
    var repoNames = [];

    var url = apiRoot + "users/" + user + "/repos";
    $.getJSON(url, function(data) {
        $.each(data, function(index, item) {
            repoNames.push(item.name);
        });
    });

    autoComplete.data('typeahead').source = repoNames;
}

// Display the stats
function showStats(data) {
    var err = false;
    var errMessage = '';

    if(data.status == 404) {
        err = true;
        errMessage = i18n.t('projectNotExist');
    }

    if(data.status == 403) {
        err = true;
        errMessage = i18n.t('rateLimitExceeded');
    }

    if(data.length == 0) {
        err = true;
        errMessage = getQueryVariable("page") > 1 ? i18n.t('noMoreReleases') : i18n.t('noReleases');
    }

    var html = "";

    if(err) {
        html += "<div class='col-md-6 col-md-offset-3 alert alert-danger output'>" + errMessage + "</div>";
    } else {
        html += "<div class='col-md-6 col-md-offset-3 output'>";

        var isLatestRelease = getQueryVariable("page") == 1 ? true : false;
        var totalDownloadCount = 0;
        $.each(data, function(index, item) {
            var releaseTag = item.tag_name;
            var releaseBadge = "";
            var releaseClassNames = "release";
            var releaseURL = item.html_url;
            var isPreRelease = item.prerelease;
            var releaseAssets = item.assets;
            var releaseDownloadCount = 0;
            var releaseAuthor = item.author;
            var publishDate = item.published_at.split("T")[0];

            if(isPreRelease) {
                releaseBadge = "&nbsp;&nbsp;<span class='badge'>" + i18n.t('preRelease') + "</span>";
                releaseClassNames += " pre-release";
            } else if(isLatestRelease) {
                releaseBadge = "&nbsp;&nbsp;<span class='badge'>" + i18n.t('latestRelease') + "</span>";
                releaseClassNames += " latest-release";
                isLatestRelease = false;
            }

            var downloadInfoHTML = "";
            if(releaseAssets.length) {
                downloadInfoHTML += "<h4><span class='glyphicon glyphicon-download'></span>&nbsp;&nbsp;" +
                    i18n.t('downloadInfo') + "</h4>";

                downloadInfoHTML += "<ul>";

                $.each(releaseAssets, function(index, asset) {
                    var assetSize = (asset.size / 1048576.0).toFixed(2);
                    var lastUpdate = asset.updated_at.split("T")[0];

                    downloadInfoHTML += "<li><code>" + asset.name + "</code> (" + assetSize + "&nbsp;" + i18n.t('mib') + ") - " +
                        i18n.t('downloads') + "&nbsp;" + formatNumber(asset.download_count) + "&nbsp;" + i18n.t('times') + ". " +
                        i18n.t('lastUpdated') + "&nbsp;" + lastUpdate + "</li>";

                    totalDownloadCount += asset.download_count;
                    releaseDownloadCount += asset.download_count;
                });
            }

            html += "<div class='row " + releaseClassNames + "'>";

            html += "<h3><span class='glyphicon glyphicon-tag'></span>&nbsp;&nbsp;" +
                "<a href='" + releaseURL + "' target='_blank'>" + releaseTag + "</a>" +
                releaseBadge + "</h3>" + "<hr class='release-hr'>";

            html += "<h4><span class='glyphicon glyphicon-info-sign'></span>&nbsp;&nbsp;" +
                i18n.t('releaseInfo') + "</h4>";

            html += "<ul>";

            if (releaseAuthor) {
                html += "<li><span class='glyphicon glyphicon-user'></span>&nbsp;&nbsp;" +
                    i18n.t('author') + ": <a href='" + releaseAuthor.html_url + "'>@" + releaseAuthor.login  +"</a></li>";
            }

            html += "<li><span class='glyphicon glyphicon-calendar'></span>&nbsp;&nbsp;" +
                i18n.t('published') + ": " + publishDate + "</li>";

            if(releaseDownloadCount) {
                html += "<li><span class='glyphicon glyphicon-download'></span>&nbsp;&nbsp;" +
                    i18n.t('downloads') + ": " + formatNumber(releaseDownloadCount) + "</li>";
            }

            html += "</ul>";

            html += downloadInfoHTML;

            html += "</div>";
        });

        if(totalDownloadCount) {
            var totalHTML = "<div class='row total-downloads'>";
            totalHTML += "<h1><span class='glyphicon glyphicon-download'></span>&nbsp;&nbsp;" + i18n.t('totalDownloads') + "</h1>";
            totalHTML += "<span>" + formatNumber(totalDownloadCount) + "</span>";
            totalHTML += "</div>";

            html = totalHTML + html;
        }

        html += "</div>";
    }

    var resultDiv = $("#stats-result");
    resultDiv.hide();
    resultDiv.html(html);
    $("#loader-gif").hide();
    resultDiv.slideDown();
}

// Callback function for getting release stats
function getStats(page, perPage) {
    var user = $("#username").val();
    var repository = $("#repository").val();

    var url = apiRoot + "repos/" + user + "/" + repository + "/releases" +
        "?page=" + page + "&per_page=" + perPage;
    $.getJSON(url, showStats).fail(showStats);
}

// Redirection function
function redirect(page, perPage) {
    window.location = "?username=" + $("#username").val() +
        "&repository=" + $("#repository").val() +
        "&page=" + page + "&per_page=" + perPage +
        ((getQueryVariable("search") == "0") ? "&search=0" : "");
}

// The main function
$(function() {
    updateUIText();
    
    $("#loader-gif").hide();

    validateInput();
    $("#username, #repository").keyup(validateInput);

    $("#username").change(getUserRepos);

    $("#get-stats-button").click(function() {
        redirect(page, perPage);
    });

    $("#get-prev-results-button").click(function() {
        redirect(page > 1 ? --page : 1, perPage);
    });

    $("#get-next-results-button").click(function() {
        redirect(++page, perPage);
    });

    $("#per-page select").on('change', function() {
        if(username == "" && repository == "") return;
        redirect(page, this.value);
    });

    var username = getQueryVariable("username");
    var repository = getQueryVariable("repository");
    var showSearch = getQueryVariable("search");
    var page = getQueryVariable("page") || 1;
    var perPage = getQueryVariable("per_page") || 5;

    if(username != "" && repository != "") {
        $("#username").val(username);
        $("#title .username").text(username);
        $("#repository").val(repository);
        $("#title .repository").text(repository);
        $("#per-page select").val(perPage);
        validateInput();
        getUserRepos();
        $(".output").hide();
        $("#description").hide();
        $("#loader-gif").show();
        getStats(page, perPage);

        if(showSearch == "0") {
            $("#search").hide();
            $("#description").hide();
            $("#title").show();
        }
    } else {
        $("#username").focus();
    }
});
