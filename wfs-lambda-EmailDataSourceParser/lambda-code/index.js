/* Function Name - EmailDataSourceParser
* This function parses the sourceinfo blob for email data sources
*/

const fileDelimiter = "|";
var correlationID, queryID, queryDate;

var OutboundCalls = {
    facebook: false,
    twitter: false,
    amazonwishlist: false,
    pandora: false,
    yahoo: false,
    linkedin: false,
    rapportive: false,
    flickr: false
};

exports.handler = function (event, context, callback) {
    console.log("Processing Email Data Sources");
    var nSuccess = 0, nFailed = 0, nDropped = 0, output = [];

    event.records.map((record) => {
        var dataSourceJSON, sendToRedshift = false, hasBG = false, hasBV = false, hasFC = false, hasOC = false, hasSM = false, hasTD = false;
        var peopleName, peopleBirthDate, peopleGender, peopleContactsCount, peopleEmailsCount, peopleWebsiteCount, peopleRelatedPeopleCount, peopleRelatedCompaniesCount
            , bv_status, disposable, roleAddress, duration
            , fc_status, likelihood, photosCount, familyName, givenName
            , fullName, websiteCount, chatCount, organizationCount
            , organizationName, organizationStartDate, organizationTitle, demoCity, demoState, demoCountry
            , demoLikelihood, demoAge, isMale, socialProfilesCount, socialProfilesHasTwitter, socialProfilesHasLinkedIn
            , socialProfilesHasGooglePlus, socialProfilesHasFacebook
            , smData
            , demoOk, demoStatusCode, demoVelocity, demoFirstSeen, demoLongevity, demoPopularity, emailOk
            , emailValidationLevel, emailStatusCode, emailStatusDescription, emailDomainType, emailRole, statusCode, statusDescription;


        var recordData = new Buffer.from(record.data, 'base64').toString("utf8");
        //console.log("Processing started for record #" + record.recordId);
        //console.log("Record Data - " + recordData);
        try {
            var startOfBlob = recordData.indexOf("|{");                                     // Find index of the start of the blob data
            var queryData = recordData.substring(0, startOfBlob).split('|');                     // Get all data except blob

            var clientID = queryData[0];
            var companyID = queryData[1];
            var departmentID = queryData[2];
            var queryDateOriginalFormat = new Date(queryData[5]);
            queryDate = queryDateOriginalFormat.getFullYear() + "-" + (queryDateOriginalFormat.getMonth() + 1) + "-" + queryDateOriginalFormat.getDate() + " " +
                queryDateOriginalFormat.getHours() + ":" + queryDateOriginalFormat.getMinutes() + ":" + queryDateOriginalFormat.getSeconds();
            queryID = queryData[4];
            correlationID = queryData[6];
            if(!correlationID){
                correlationID = 0;
            }
            var queryType = queryData[3];
            var sourceInfo = recordData.substring(startOfBlob + 1, recordData.length).replace(/\|/gi, "-").replace(/[^\x00-\x7F]/g, "").replace(/\0/g, "");    // Get blob data and remove pipe and other invalid characters
            var sourceData = correlationID + fileDelimiter + queryID + fileDelimiter + queryDate;

            if ((queryType == "EmailRisk" || queryType == "EmailIPRisk") && sourceInfo !== null) {
                var sourceInfoJSON = JSON.parse(sourceInfo);
                var Items = Object.values(sourceInfoJSON.ItemsByHandleService);

                if (Items) {
                    for (i = 0; i < Items.length; i++) {
                        switch (Items[i].HandleService) {
                            case 505:
                                if(Items[i].DataSourceRaw) {
                                    dataSourceJSON = JSON.parse(Items[i].DataSourceRaw);
                                    var OperationResult = dataSourceJSON.OperationResult;
                                    if (OperationResult) {
                                        if (OperationResult.Entities) {
                                            var FirstInPeople = OperationResult.Entities[0].People[0];

                                            if (FirstInPeople) {
                                                peopleName = GetTrimmedString(FirstInPeople.Name, 400);
                                                peopleBirthDate = FirstInPeople.Birthdate && !isNaN(Date.parse(FirstInPeople.Birthdate)) ? FirstInPeople.Birthdate : "";
                                                peopleGender = GetTrimmedString(FirstInPeople.Gender, 10);
                                                var contacts = FirstInPeople.Contacts;
                                                var emails = FirstInPeople.Emails;
                                                var websites = FirstInPeople.Websites;
                                                var relatedPeople = FirstInPeople.RelatedPeople;
                                                var relatedCompanies = FirstInPeople.RelatedCompanies;
                                                peopleContactsCount = contacts ? contacts.length : null;
                                                peopleEmailsCount = emails ? emails.length : null;
                                                peopleWebsiteCount = websites ? websites.length : null;
                                                peopleRelatedPeopleCount = relatedPeople ? relatedPeople.length : null;
                                                peopleRelatedCompaniesCount = relatedCompanies ? relatedCompanies.length : null;

                                                hasBG = true;
                                            }
                                        }
                                    }
                                }
                                break;

                            case 23:
                                if(Items[i].DataSourceRaw) {
                                    dataSourceJSON = JSON.parse(Items[i].DataSourceRaw);
                                    bv_status = GetTrimmedString(dataSourceJSON.status, 50);
                                    disposable = dataSourceJSON.disposable !== null && typeof(dataSourceJSON.disposable) == "boolean" ? dataSourceJSON.disposable : null;
                                    roleAddress = dataSourceJSON.role_address !== null && typeof(dataSourceJSON.role_address) == "boolean" ? dataSourceJSON.role_address : null;
                                    duration = dataSourceJSON.duration && !isNaN(dataSourceJSON.duration) ? dataSourceJSON.duration : null;

                                    hasBV = true;
                                }
                                break;

                            case 502:
                                if(Items[i].DataSourceRaw) {
                                    dataSourceJSON = JSON.parse(Items[i].DataSourceRaw);
                                    fc_status = GetTrimmedString(dataSourceJSON.status, 20);
                                    likelihood = dataSourceJSON.likelihood && !isNaN(dataSourceJSON.likelihood) ? dataSourceJSON.likelihood : null;

                                    photosCount = dataSourceJSON.photos ? dataSourceJSON.photos.length : null;

                                    var ContactInfo = dataSourceJSON.contactInfo;
                                    if (ContactInfo) {
                                        familyName = GetTrimmedString(ContactInfo.familyName, 200);
                                        givenName = GetTrimmedString(ContactInfo.givenName, 200);
                                        fullName = GetTrimmedString(ContactInfo.fullName, 200);
                                        websiteCount = ContactInfo.websites ? ContactInfo.websites.length : null;
                                        chatCount = ContactInfo.chats ? ContactInfo.chats.length : null;
                                    }

                                    var Organizations = dataSourceJSON.organizations;
                                    if (Organizations) {
                                        organizationCount = Organizations.length;
                                        organizationName = GetTrimmedString(Organizations[0].name, 200);
                                        organizationStartDate = GetTrimmedString(Organizations[0].startDate, 50);
                                        organizationTitle = GetTrimmedString(Organizations[0].title, 400);
                                    }

                                    var Demographics = dataSourceJSON.demographics;
                                    if (Demographics) {
                                        var demoLocationDeduced = Demographics.locationDeduced;
                                        if (demoLocationDeduced) {
                                            demoCity = demoLocationDeduced.city ? GetTrimmedString(demoLocationDeduced.city.name, 200) : null;
                                            demoState = demoLocationDeduced.state ? GetTrimmedString(demoLocationDeduced.state.name, 200) : null;
                                            demoCountry = demoLocationDeduced.country ? GetTrimmedString(demoLocationDeduced.country.code, 50) : null;
                                            demoLikelihood = demoLocationDeduced.likelihood && !isNaN(demoLocationDeduced.likelihood) ? demoLocationDeduced.likelihood : null;
                                        }
                                        demoAge = Demographics.age && !isNaN(Demographics.age) ? Demographics.age : null;
                                        isMale = Demographics.gender ? (Demographics.gender.toLowerCase() == "male" ? true : (Demographics.gender.toLowerCase() == "female" ? false : "")) : "";
                                    }

                                    var SocialProfiles = dataSourceJSON.socialProfiles;
                                    if (SocialProfiles) {
                                        socialProfilesCount = SocialProfiles.length;
                                        socialProfilesHasTwitter = socialProfilesHasLinkedIn = socialProfilesHasGooglePlus = socialProfilesHasFacebook = false;
                                        for(var type = 0; type < socialProfilesCount; type++) {
                                            if(SocialProfiles[type].typeId == "twitter")
                                                socialProfilesHasTwitter = true;
                                            if(SocialProfiles[type].typeId == "linkedin")
                                                socialProfilesHasLinkedIn = true;
                                            if(SocialProfiles[type].typeId == "googleplus")
                                                socialProfilesHasGooglePlus = true;
                                            if(SocialProfiles[type].typeId == "facebook")
                                                socialProfilesHasFacebook = true;
                                        }
                                    }

                                    hasFC = true;
                                }
                                break;

                            case 2:
                                if(Items[i].DataSourceRaw) {
                                    dataSourceJSON = Items[i].DataSourceRaw;
                                    if (dataSourceJSON) {
                                        smData = GetTrimmedString(dataSourceJSON.replace(/[^\x00-\x7F]/g, "").replace(/\0/g, ""), 1200);
                                        hasSM = true;
                                    }
                                }
                                break;

                            case 503:
                                if(Items[i].DataSourceRaw) {
                                    dataSourceJSON = JSON.parse(Items[i].DataSourceRaw);

                                    Demographics = dataSourceJSON.demographics;
                                    Email = dataSourceJSON.email;

                                    if (Demographics) {
                                        //Demographics values
                                        demoOk = Demographics.ok != null && typeof(Demographics.ok) == "boolean" ? Demographics.ok : null;
                                        demoStatusCode = Demographics.status_code && !isNaN(Demographics.status_code) ? Demographics.status_code : null;
                                        demoVelocity = Demographics.velocity && !isNaN(Demographics.velocity) ? Demographics.velocity : null;
                                        demoFirstSeen = GetTrimmedString(Demographics.date_first_seen, 50);
                                        demoLongevity = Demographics.longevity && !isNaN(Demographics.longevity) ? Demographics.longevity : null;
                                        demoPopularity = Demographics.popularity && !isNaN(Demographics.popularity) ? Demographics.popularity : null;
                                    }

                                    if (Email) {
                                        //Email values
                                        emailOk = Email.ok != null && typeof(Email.ok) == "boolean" ? Email.ok : null;
                                        emailValidationLevel = Email.validation_level && !isNaN(Email.validation_level) ? Email.validation_level : null;
                                        emailStatusCode = Email.status_code && !isNaN(Email.status_code) ? Email.status_code : null;
                                        emailStatusDescription = GetTrimmedString(Email.status_desc, 400);
                                        emailDomainType = GetTrimmedString(Email.domain_type, 200);
                                        emailRole = Email.role != null && typeof(Email.role) == "boolean" ? Email.role : null;
                                    }

                                    statusCode = dataSourceJSON.status_code && !isNaN(dataSourceJSON.status_code) ? dataSourceJSON.status_code : null;
                                    statusDescription = GetTrimmedString(dataSourceJSON.status_desc, 200);

                                    hasTD = true;
                                }
                                break;

                            case 105:
                                OutboundCalls.facebook = Items[i].ProfileAddress ? true : false;
                                hasOC = true;
                                break;
                            case 107:
                                OutboundCalls.twitter = Items[i].ProfileAddress ? true : false
                                hasOC = true;
                                break;
                            case 111:
                                OutboundCalls.amazonwishlist = Items[i].ProfileAddress ? true : false
                                hasOC = true;
                                break;
                            case 601:
                                OutboundCalls.pandora = Items[i].ProfileAddress ? true : false
                                hasOC = true;
                                break;
                            case 101:
                                OutboundCalls.yahoo = Items[i].ProfileAddress ? true : false
                                hasOC = true;
                                break;
                            case 117:
                                OutboundCalls.linkedin = Items[i].ProfileAddress ? true : false
                                hasOC = true;
                                break;
                            case 501:
                                OutboundCalls.rapportive = Items[i].ProfileAddress ? true : false
                                hasOC = true;
                                break;
                            case 112:
                                OutboundCalls.flickr = Items[i].ProfileAddress ? true : false
                                hasOC = true;
                                break;
                            default: break;
                        }
                    }
                    if(!hasOC)
                        OutboundCalls = {
                            facebook: null,
                            twitter: null,
                            amazonwishlist: null,
                            pandora: null,
                            yahoo: null,
                            linkedin: null,
                            rapportive: null,
                            flickr: null
                        };
                    //console.log(hasBG + fileDelimiter + hasBV + fileDelimiter + hasFC + fileDelimiter + hasOC + fileDelimiter + hasSM + fileDelimiter + hasTD);
                    sourceData = sourceData
                        + fileDelimiter + hasBG + fileDelimiter + hasBV + fileDelimiter + hasFC + fileDelimiter + hasOC + fileDelimiter + hasSM + fileDelimiter + hasTD
                        + fileDelimiter + peopleName + fileDelimiter + peopleBirthDate + fileDelimiter + peopleGender + fileDelimiter + peopleContactsCount + fileDelimiter
                        + peopleEmailsCount + fileDelimiter + peopleWebsiteCount + fileDelimiter + peopleRelatedPeopleCount + fileDelimiter + peopleRelatedCompaniesCount
                        + fileDelimiter + bv_status + fileDelimiter + disposable + fileDelimiter + roleAddress + fileDelimiter + duration
                        + fileDelimiter + fc_status + fileDelimiter + likelihood + fileDelimiter + photosCount + fileDelimiter + familyName + fileDelimiter + givenName + fileDelimiter
                        + fullName + fileDelimiter + websiteCount + fileDelimiter + chatCount + fileDelimiter + organizationCount + fileDelimiter
                        + organizationName + fileDelimiter + organizationStartDate + fileDelimiter + organizationTitle + fileDelimiter + demoCity + fileDelimiter + demoState + fileDelimiter + demoCountry + fileDelimiter
                        + demoLikelihood + fileDelimiter + demoAge + fileDelimiter + isMale + fileDelimiter + socialProfilesCount + fileDelimiter + socialProfilesHasTwitter + fileDelimiter + socialProfilesHasLinkedIn
                        + fileDelimiter + socialProfilesHasGooglePlus + fileDelimiter + socialProfilesHasFacebook
                        + fileDelimiter + OutboundCalls.facebook + fileDelimiter + OutboundCalls.twitter + fileDelimiter + OutboundCalls.amazonwishlist + fileDelimiter + OutboundCalls.pandora + fileDelimiter
                        + OutboundCalls.yahoo + fileDelimiter + OutboundCalls.linkedin + fileDelimiter + OutboundCalls.rapportive + fileDelimiter + OutboundCalls.flickr
                        + fileDelimiter + smData
                        + fileDelimiter + demoOk + fileDelimiter + demoStatusCode + fileDelimiter + demoVelocity + fileDelimiter
                        + demoFirstSeen + fileDelimiter + demoLongevity + fileDelimiter + demoPopularity + fileDelimiter + emailOk + fileDelimiter
                        + emailValidationLevel + fileDelimiter + emailStatusCode + fileDelimiter + emailStatusDescription + fileDelimiter + emailDomainType + fileDelimiter + emailRole
                        + fileDelimiter + statusCode + fileDelimiter + statusDescription;

                    sourceData = sourceData.replace(/undefined/gi, "").replace(/null/gi, "").replace(/\r\n/gi, " ").replace(/\r/gi, " ").replace(/\n/gi, " ") + "\r\n";
                    //console.log("Redshift Data : " + sourceData);
                    if(hasBG || hasBV || hasFC || hasSM || hasTD || hasOC) {
                        sendToRedshift= true;
                        output.push({
                            recordId: record.recordId,
                            result: 'Ok',
                            data: new Buffer.from(sourceData).toString('base64')
                        });
                        nSuccess = nSuccess + 1;
                    }
                }
            }

            if(!sendToRedshift)
            {
                console.log("Dropping query info, Query Type : " + queryType + ", # : " + record.recordId + " - " + queryID);
                output.push({
                    recordId: record.recordId,
                    result: 'Dropped',
                    data: record.data
                });
                nDropped = nDropped + 1;
            }
        }
        catch(ex) {
            output.push({
                recordId: record.recordId,
                result: 'ProcessingFailed',
                data: record.data
            });
            nFailed = nFailed + 1;
            //console.log("QueryID - " + queryID + ", " + hasBG + fileDelimiter + hasBV + fileDelimiter + hasFC + fileDelimiter + hasOC + fileDelimiter + hasSM + fileDelimiter + hasTD);
            console.log("# : " + record.recordId + " - " + queryID + ", Processing error: " + ex + "\nstack - " + ex.stack);
        }
    });

    console.log("Record Count - Success/Failed/Dropped/Total : " + nSuccess + "/ " + nFailed + "/" + nDropped + "/" + event.records.length);

    callback(null, { records : output });
}

function GetTrimmedString(inputString, lengthOfString) {
    if(inputString && inputString.length > lengthOfString)
        return inputString.substring(0, lengthOfString);
    else
        return inputString ? inputString : null;
}
