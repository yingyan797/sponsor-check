function process_file(mode) {
    var file = document.getElementById("campaign").files[0];
    const avoid_columns = ["submitted", "approved"];
    if ("url_switch" in mode) {
        if (document.getElementById("url_on").style.display == "none") {
            document.getElementById("url_on").style.display = "block";
        } else {
            document.getElementById("url_on").style.display = "none";
        }
    }
    function create_table(text) {
        if (text[-1] != '\n') {
            text += '\n';
        }
        const col_names = [];
        const nums_avoid = []
        let read_body = false;
        let col_num = 0;
        const rows = [];
        let row = [];
        let entry = "";
        let paragraph = false;
        for (const c of text) {
            if (c == "\"") {
                paragraph = !paragraph;
                continue;
            }
            if (paragraph) {
                entry += c;
                continue;
            }
            if (c == ',' || c == '\n') {
                if (! read_body) {
                    if (! avoid_columns.includes(entry)) 
                        col_names.push(entry);
                    else
                        nums_avoid.push(col_num);
                } else if (! nums_avoid.includes(col_num)) {
                    row.push(entry);
                }
                entry = "";
                if (c == '\n') {
                    read_body = true;
                    col_num = 0;
                    if (row.length > 0)
                        rows.push(row);
                    row = [];
                } else {
                    col_num++;
                }
            } else {
                entry += c;
            }
        }
        const message_col = col_names.indexOf("message");
        const sender_col = col_names.indexOf("sender");
        let res_html = "<table><tr>";
        col_names.forEach((n, i) => res_html += "<th>"+n+"</th>");
        res_html += "</tr>\n";
        rows.forEach((r, i) => {
            if (document.getElementById("sender").value != "" && r[sender_col].toLowerCase().indexOf(document.getElementById("sender").value.toLowerCase()) < 0)
                {return}
            let row_html = "<tr>";
            r.forEach((entry, j) => {
                let content = "";
                let k = 0;
                if (j == message_col && entry.includes(":")) {
                    k = entry.indexOf(':');
                    let color = "green";
                    if (entry.substring(0,k).toLowerCase().indexOf("reject") >= 0) {
                        color = "orange";
                    }
                    content = "<b style='color:"+color+"'>"+entry.substring(0, k)+"</b>";
                }
                if (document.getElementById("url_on").style.display == "none") {
                    content += entry.substring(k);
                } else {
                    let n_urls = 0;
                    while (k < entry.length) {
                        if (entry.substring(k, k+7) == "http://" || entry.substring(k, k+8) == "https://") {
                            n_urls++;
                            let s = k;
                            k += 7;
                            while (k < entry.length && !" \n\t\r".includes(entry[k])) {
                                k++;
                            }
                            content += "<a href='"+entry.substring(s,k)+"'>[Reference URL "+n_urls+"]</a>"
                        } else {
                            content += entry[k];
                            k++;
                        }
                    }
                }
                row_html += "<td title='"+col_names[j]+"'>"+content+"</td>";
            })
            res_html += row_html+"</tr>\n"
        })
        res_html += "</table>";
        return res_html;
    }

    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            document.getElementById("fileContents").innerHTML = create_table(evt.target.result);
        }
        reader.onerror = function (evt) {
            document.getElementById("fileContents").innerHTML = "error reading data file";
        }
    }
}
