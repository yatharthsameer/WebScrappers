// ****************************************************************************************************************************
// Abstract:
// This script is just a quick trick to export the owners and members of a team as a CSV file without administrator permissions.
// The following properties are exported: Display name, Title, Location, Role, Tags, UPN(email)
//
// Usage:
// 1. Open the team in your web browser: https://teams.microsoft.com
// 2. Select "Manage team" from its menu.
// 3. Select the "Members" tab.
// 4. Expand the "Owners" and "Members and guests" sections.
// 5. Scroll down to the end of the owners and members lists to include all of them in the export.
// 6. Open your browser's console by pressing CTRL+SHIFT+i (developer tools).
// 7. In the developer tools, select the Console tab - at the bottom of the console is the input field.
// 8. Click the RAW button of this Gist, copy the code, and paste this script to the input field and press "enter" key.
// 9. The CSV file download should start automatically.
//
// Link mentioned in old blogs/posts:
// - http://web.archive.org/web/20220119111816/https://developers.salestim.com/blog/export-microsoft-teams-team-members/
// ****************************************************************************************************************************

$(function () {

    // **************
    // Initialization
    // **************
    const csvFileName = 'team-membership-roster-export.csv'
    const csvDelimiter = '","'
    const csvHeader = '"' + 'DisplayName' + csvDelimiter + 'Title' + csvDelimiter + 'Location' + csvDelimiter + 'Role' + csvDelimiter + 'Tags' + csvDelimiter + 'UPN' + '"' + '\r\n' // CSV header row
    let csvContent = csvHeader // Initialize CSV content
    const rosterLength = $('.td-member-display-name').length // Number of visible members

    // Check if we're an owner of the team
    let roleSelector = '.td-member-role' // Consider we're not an owner by default
    if ($('.td-member-editable-role').length > 0) {
        roleSelector = '.td-member-editable-role' // Override if we're an owner
    }

    // ************************
    // Iterate over each member
    // ************************
    for (let index = 0; index < rosterLength; index++) {
        // Extract the display name, title, location, role, and UPN
        let displayName = $('.td-member-display-name').eq(index).text()
        const title = $('.td-member-title').eq(index).text()
        const location = $('.td-member-location').eq(index).text()
        let role = $(roleSelector).eq(index).text()
        let upn = $('.td-member-photo img').eq(index).attr('upn')
        // If user is an external guest, return their email, set role to Guest, and fix up display name
        if (upn.includes("#EXT#")) {
            let encEmail = upn.split('#')[0];
            let lastIndex = encEmail.lastIndexOf('_');
            let extEmail = encEmail.substring(0, lastIndex) + '@' + encEmail.substring(lastIndex + 1);
            upn = extEmail;
            role = 'Guest'
            displayName = displayName.replace(' (Guest)','')
        }
        // Extract tags
        let arrTags = new Array()
        const numTags = $('.tags-container').eq(index).children().length
        for (let jndex = 0; jndex < numTags - 2; jndex++) {
            arrTags.push($('.tags-container').eq(index).children().eq(jndex).text())
        }
        let tags = arrTags.sort().join('|')
        // Append to the CSV content
        const csvRow = '"' + displayName + csvDelimiter + title + csvDelimiter + location + csvDelimiter + role + csvDelimiter + tags + csvDelimiter + upn + '"' + '\r\n'
        csvContent += csvRow
    }

    // Debug the export to console
    console.info(rosterLength + ' members exported:')
    console.info(csvContent)

    // **********************************************************
    // Dynamically generates a CSV file and triggers its download
    // **********************************************************

    // Create a dynamic "a" tag
    var element = document.createElement('a')
    // Set href link with content
    element.setAttribute(
        'href',
        'data:application/json;charset=utf-8,' + encodeURIComponent(csvContent)
    )
    // Set downloaded file name
    element.setAttribute('download', csvFileName)
    // Hide the element and add it to the page
    element.style.display = 'none'
    document.body.appendChild(element)
    // Launch download
    element.click()
    // Remove element
    document.body.removeChild(element)
})
