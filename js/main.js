//Holder på informasjonen som kommer fra XML filen
var x;

//Ser etter XML og kaller eventuelt på makeTable();
function checkForXML() {
    var search = document.getElementById("textid").value;
    if (search.length >= 3) {
        var url;
        if (search.toString().length === 9 && !isNaN(search)) {
            url = "http://data.brreg.no/enhetsregisteret/enhet.xml?page=0&size=100&$filter=organisasjonsnummer%20eq%20" + search;
        } else {
            url = "http://data.brreg.no/enhetsregisteret/enhet.xml?page=0&size=100&$filter=startswith(navn,'" + search + "')";
        }
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 || this.status == 200) {
                document.getElementById("showInfo").innerHTML = "";
                makeTable(this);
            }
        };
        xmlhttp.open("GET", url, false);
        xmlhttp.send();
    }
}

//Skriver ut XML filen som en liste
function makeTable(xml) {
    var elementer, i;
    var xmlDoc = xml.responseXML;
    var table = "<tr><th>Organisasjonsnummer</th><th>Foretaksnavn</th><th>Konkurs</th></tr>";
    x = xmlDoc.getElementsByTagName('enhet');

    if (x.length === 1) {
        elementer = "Viser " + x.length + " element - trykk på elementet for å få mer informasjon om bedriften";
    } else if (x.length < 100) {
        elementer = "Viser " + x.length + " elementer - trykk på bedriften du vil ha mer informasjon om";
    } else {
        elementer = "Viser de første " + x.length + " elementer - trykk på bedriften du vil ha mer informasjon om";
    }
    document.getElementById("numberOfElements").innerHTML = "<i>" + elementer + "</i>";
    for (i = 0; i < x.length; i++) {
        var fields = getMyFields(x[i]);
        var konk = fields.konkurs;
        if (konk === "N") {
            konk = "Nei";
        } else {
            konk = "<b><u>Ja</u></b>";
        }
        table += "<tr onclick='displayExtraInfo(" + i + ")'><td>" +
            fields.orgNr + "</td><td>" +
            fields.navn + "</td><td>" +
            konk + "</td></tr>";
    }
    document.getElementById("myTable").innerHTML = table;
}

//Skriver ut ekstra info onclick på tabellen
function displayExtraInfo(i) {
    var fields = getMyFields(x[i]);

    document.getElementById("showInfo").innerHTML =
        printBankrupt(fields.konkurs) + "<br>" +
        "Organisasjonsnummer: " + fields.orgNr + "<br>" +
        "Foretaksnavn: " + fields.navn + "<br>" +
        "Antall ansatte: " + fields.antallAnsatte + "<br>" +
        "Organisasjonsform: " + fields.organForm + "<br>" +
        "Registreringsdato: " + fields.regDato + "<br>" +
        "Næringsbeskrivelse: " + fields.bedriftBeskrivelse + "<br>" +
        printIfAddress(fields.forretningsAdresse) + "<br>" +
        printIfHomepage(fields.hjemmeside) + "<br>" +
        printIfEmail(fields.email) + "<br>"
    ;
}

//Hjelpemetode for adresse
function printIfAddress(add) {
    if (add.length === 0) {
        return "";
    }
    return ("Forretningsadresse: " + add);
}
//Hjelpemetode for konkurs
function printBankrupt(konk) {
    if (konk === "N") {
        return "<strong><em>Selskapet er i drift</em></strong>";
    }
    return ("<strong><em> Selskapet er konkurs</em></strong>");
}
//Hjelpemetode for hjemmeside
function printIfHomepage(hjem) {
    if (hjem === "") {
        return "";
    }
    return ("Hjemmeside: <a href=http://" + hjem + ">" + hjem + "</a>");
}
//Hjelpemetode for for email.
function printIfEmail(email) {
    if (email === "") {
        return "";
    }
    return ("Email: <a href=mailto:" + email + ">" + email + "</a>");
}

//Hjelpemetode for å returnere elementene på en bedre måte
function getMyFields(elem) {
    var konkurs = elem.getElementsByTagName("konkurs")[0].childNodes[0].nodeValue;
    var navn = elem.getElementsByTagName("navn")[0].childNodes[0].nodeValue;
    var orgNr = elem.getElementsByTagName("organisasjonsnummer")[0].childNodes[0].nodeValue;
    var regDato = elem.getElementsByTagName("registreringsdatoEnhetsregisteret")[0].childNodes[0].nodeValue;
    var postSted = elem.getElementsByTagName("poststed")[0].childNodes[0].nodeValue;
    var organForm = elem.getElementsByTagName("orgform")[0].getElementsByTagName("beskrivelse")[0].childNodes[0].nodeValue;
    var antallAnsatte = elem.getElementsByTagName("antallAnsatte")[0].childNodes[0].nodeValue;

    var email = "";
    if (elem.getElementsByTagName("email")[0] !== undefined) {
        email = elem.getElementsByTagName("email")[0].childNodes[0].nodeValue;
    }

    var bedriftBeskrivelse = "";
    if (elem.getElementsByTagName("naeringskode1")[0] !== undefined) {
        if (elem.getElementsByTagName("naeringskode1")[0].getElementsByTagName("beskrivelse").length !== 0)
            bedriftBeskrivelse = elem.getElementsByTagName("naeringskode1")[0].getElementsByTagName("beskrivelse")[0].childNodes[0].nodeValue;
    }

    var hjemmeside = "";
    if (elem.getElementsByTagName("hjemmeside")[0] !== undefined) {
        hjemmeside = elem.getElementsByTagName("hjemmeside")[0].childNodes[0].nodeValue;
    }

    var forretningsAdresse = "";
    forretningsAdresse = getAddress(elem, forretningsAdresse);
    return {
        konkurs: konkurs,
        orgNr: orgNr,
        navn: navn,
        organForm: organForm,
        postSted: postSted,
        regDato: regDato,
        bedriftBeskrivelse: bedriftBeskrivelse,
        hjemmeside: hjemmeside,
        forretningsAdresse: forretningsAdresse,
        antallAnsatte: antallAnsatte,
        email: email
    };
}

//Hjelpemetode for å formatere adressen
function getAddress(elem, forretningsAdresse) {
    if (elem.getElementsByTagName("forretningsadresse")[0] !== undefined) {
        if (elem.getElementsByTagName("forretningsadresse")[0].getElementsByTagName("adresse").length !== 0) {
            forretningsAdresse += elem.getElementsByTagName("forretningsadresse")[0].getElementsByTagName("adresse")[0].childNodes[0].nodeValue + ", ";
        }
        if (elem.getElementsByTagName("forretningsadresse")[0].getElementsByTagName("postnummer").length !== 0) {
            forretningsAdresse += elem.getElementsByTagName("forretningsadresse")[0].getElementsByTagName("postnummer")[0].childNodes[0].nodeValue + " ";
        }
        if (elem.getElementsByTagName("forretningsadresse")[0].getElementsByTagName("kommune").length !== 0) {
            var tempAdd = elem.getElementsByTagName("forretningsadresse")[0].getElementsByTagName("kommune")[0].childNodes[0].nodeValue.toLowerCase();
            forretningsAdresse += tempAdd[0].toUpperCase() + tempAdd.slice(1) + ", ";
        }
        forretningsAdresse += elem.getElementsByTagName("forretningsadresse")[0].getElementsByTagName("land")[0].childNodes[0].nodeValue;
    }
    return forretningsAdresse;
}
