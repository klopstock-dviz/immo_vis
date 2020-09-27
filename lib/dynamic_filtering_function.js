var data = [
    {
        "address": "1234 Example Lane",
        "city": "Portland",
        "state": "OR",
        "zip": "97201",
        "listPrice": 350000,
        "daysActive": 12,
        "type": "House",
        "yearBuilt": 1908,
        "bedrooms": 3,
        "bathrooms": 1,
        "squareFootage": 1250,
        "hoa": false,
        "backyard": true,
        "ac": false,
        "washerDryerInUnit": true,
        "petsAllowed": true,
        "saleType": "For Sale"
    },
    {
        "address": "9999 SW 4th Ave",
        "city": "Portland",
        "state": "OR",
        "zip": "97201",
        "listPrice": 1200,
        "daysActive": 3,
        "type": "Apartment",
        "yearBuilt": 2002,
        "bedrooms": 1,
        "bathrooms": 1,
        "squareFootage": 655,
        "hoa": false,
        "backyard": false,
        "ac": false,
        "washerDryerInUnit": true,
        "petsAllowed": true,
        "saleType": "For Rent"
    },
    {
        "address": "8888 NW 23rd Ave",
        "city": "Portland",
        "state": "OR",
        "zip": "97201",
        "listPrice": 1150,
        "daysActive": 20,
        "type": "Apartment",
        "yearBuilt": 1930,
        "bedrooms": 1,
        "bathrooms": 1,
        "squareFootage": 487,
        "hoa": false,
        "backyard": false,
        "ac": false,
        "washerDryerInUnit": false,
        "petsAllowed": false,
        "saleType": "For Rent"
    },
    {
        "address": "9876 Sunset Dr",
        "city": "Los Angeles",
        "state": "CA",
        "zip": "90025",
        "listPrice": 2500000,
        "daysActive": 9,
        "type": "House",
        "yearBuilt": 1965,
        "bedrooms": 3,
        "bathrooms": 2.5,
        "squareFootage": 1125,
        "hoa": true,
        "backyard": true,
        "ac": true,
        "washerDryerInUnit": true,
        "petsAllowed": true,
        "saleType": "For Sale"
    },
    {
        "address": "22 N Washington Dr",
        "city": "Seattle",
        "state": "WA",
        "zip": "98109",
        "listPrice": 1750,
        "daysActive": 45,
        "type": "Apartment",
        "yearBuilt": 2010,
        "bedrooms": 2,
        "bathrooms": 1,
        "squareFootage": 950,
        "hoa": false,
        "backyard": false,
        "ac": true,
        "washerDryerInUnit": true,
        "petsAllowed": true,
        "saleType": "For Rent"
    }
]


buildFilter = (filter) => {
    let query = {};
    for (let keys in filter) {
        if ( (filter[keys].constructor === Object) || (filter[keys].constructor === Array && filter[keys].length > 0)) {
            query[keys] = filter[keys];
        }
    }
    return query;
}

// Our new filter function
filterData = (data, query) => {
    const keysWithMinMax = [
        'listPrice',
        'bedrooms'
    ];
    const filteredData = data.filter( (item) => {
        for (let key in query) {
            /* Note: this initial check can be modified in case
             *       you still want to include results that may
             *       not have that specific key.
             * 
             *       If that is the case, you can just change these
             *       checks to:
             *       
             *       if (item[key] !=== undefined) {
             *           if (keysWithMinMax.includes(key)) {
             *              ...
             *           }
             *           else if (!query[key].includes(item[key])) {
             *              ...
             *           }
             *       }
             *       
             *       This way your program won't crash when the key doesn't
             *       exist.
             */
            if (item[key] === undefined) {
                return false;
            }
            else if (keysWithMinMax.includes(key)) {
                if (query[key]['min'] !== null && item[key] < query[key]['min']) {
                    return false;
                }
                if (query[key]['max'] !== null && item[key] > query[key]['max']) {
                    return false;
                }
            }
            else if (!query[key].includes(item[key])) {
                return false;
            }
        }
        return true;
    });
    return filteredData;
};


// Updated filter
filter = {
    type: [
        'Apartment',
    ],
    saleType: [
        'For Rent',
    ],
    listPrice: {
        min: 1000,
        max: 1800
    },
    bedrooms: {
        min: 1,
        max: null
    },
    washerDryerInUnit: [
        true,
    ],
};

