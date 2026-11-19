(async () => {
    const $ = i => document.querySelector(i);
    const showContainer = (message) => {
        const c = $(".container");
        if (message) c.innerHTML = `<h1>${message}</h1>`;
        c.removeAttribute("style");
    };
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return showContainer("no id provided.");

    const res = await fetch(`https://diff.deltastalkers.fyi/${id}.json`);
    if (!res.ok) return showContainer("couldn't fetch diff.");
    const data = await res.json();
    const configs = Object.fromEntries(["matching", "outputFormat"].map(e => ([e, $(`#${e}`)])));
    const renderDiff = () => {
        const diff2htmlUi = new Diff2HtmlUI($("#diff"), data.patch, {
            outputFormat: configs.outputFormat.value || 'side-by-side',
            matching: configs.matching.value || 'words',
            colorScheme: 'auto',
            fileContentToggle: false,
            stickyFileHeaders: false
        });
        diff2htmlUi.draw();
        diff2htmlUi.highlightCode();
    };

    const oldhash = $("#oldhash");
    const oldurl = $("#oldurl");
    const newhash = $("#newhash");
    const newurl = $("#newurl");
    oldhash.textContent = data.oldHash;
    oldurl.textContent = data.oldArchive;
    oldurl.href = data.oldArchive;
    newhash.textContent = data.newHash;
    newurl.textContent = data.newArchive;
    newurl.href = data.newArchive;

    const download = $("#download");
    const blob = new Blob([data.patch], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    download.href = url;
    download.download = `${id}.diff`;

    for (const config in configs) configs[config].addEventListener("change", renderDiff);
    renderDiff();
    showContainer();
})();