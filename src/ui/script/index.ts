declare let notif: HTMLSpanElement;
declare let txtSearch: HTMLInputElement;

export function onPartClick(link: HTMLLinkElement) {
    const text = link.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
        // Find the notification sibling
        notif.classList.add('show');
        setTimeout(() => notif.classList.remove('show'), 1000);
    });
    return false;
}

export function onExampleClick(link: HTMLLinkElement) {
    const text = link.textContent;
    const title = link.title;
    const keyword = txtSearch.value;

    navigator.clipboard.writeText(`${text}\t${title}\t${keyword}`).then(() => {
        // Find the notification sibling
        notif.classList.add('show');
        setTimeout(() => notif.classList.remove('show'), 1000);
    });
    return false;
}

export function search(el: HTMLInputElement, event: KeyboardEvent) {
    if (event.code === '13') {
        window.location.href = `/?q=${el.value}`;
    }
}