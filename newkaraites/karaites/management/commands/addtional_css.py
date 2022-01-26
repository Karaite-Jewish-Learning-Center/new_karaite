# override some defaults without having to sweat on code

additional_css = """ 

.MsoTableGrid {
    width: 50%;
    margin-left: auto;
    margin-right: auto;
    font-size: 16pt;
    table-layout: fixed;
    border-collapse: collapse;
    border:none;
}

/* English*/

.MsoTableGrid tr:nth-child(even) {
    column-span: all !important;
    display: block;
    margin-left: 10%;
    margin-right: -10%;
    line-height: 1.3em;
    font-style: italic;
    font-size: 19px;
}


.MsoTableGrid tr:nth-child(odd) td:first-child {
    text-align: right;
    direction: rtl;
}

.MsoTableGrid tr:nth-child(odd) td:nth-child(2) {
    text-align: left;
    width: auto !important;
    height: auto !important;
}


.MsoTableGrid tr:nth-child(odd) td:first-child .segmenttext {
    padding-right: 10px;
    vertical-align: top;
    width: auto !important;
    height: auto !important;
}

.MsoTableGrid tr:nth-child(odd) td:nth-child(2) .segmenttext {
    padding-left: 10px;
    vertical-align: top;
    width: auto !important;
    height: auto !important;
}

/* Anochi */

.span-196, .span-198, .span-201, .span-202, .span-204 {
    color: red;
}

@media (min-width: 100px) and  (max-width: 361px) {
    .MsoTableGrid {
        width: 90%;
    }
}

@media (min-width: 362px) and  (max-width: 640px) {
    .MsoTableGrid {
        width: 90%;
    }
}

@media (min-width: 661px) and  (max-width: 900px) {
    .MsoTableGrid {
        width: 60%;
    }
}

"""
