/*InvisiClues.js v2.2*/
const invisiClues = {
	index: 1,	
	numberedList: false,
	orderedList: true,
	displayTOC: true,
	offsetAnswers: false,
	singleBulletPoints: false,
	uppercaseHeaders: false,
	noPadding: false,
	scrollTopPos: 0,
	navSections: [],
	
	dom: {
		body: null,
		main: null,
		toc: null,
		navSelect: null,
		topLink: null
	},
	
	applyConfig(data) {
		if ('numberedList' in data) {
			this.numberedList = data.numberedList;
		}
		if ('displayTOC' in data) {
			this.displayTOC = data.displayTOC;
		}
		if ('offsetAnswers' in data) {
			this.offsetAnswers = data.offsetAnswers;
		}
		if ('singleBulletPoints' in data) {
			this.singleBulletPoints = data.singleBulletPoints;
		}
		if ('uppercaseHeaders' in data) {
			this.uppercaseHeaders = data.uppercaseHeaders;
		}
		if ('orderedList' in data) {
			this.orderedList = data.orderedList;
		}
		if ('noPadding' in data) {
			this.noPadding = data.noPadding;
		}
	},
	
	buildTOC(main) {
		const tocTitle = this.titleElement("Table of Contents", "h2", false, false, true);
		tocTitle.id = "toc";
		main.appendChild(tocTitle);

		const tocDiv = document.createElement("div");
		tocDiv.className = "toc";

		const ul = document.createElement("ul");

		tocDiv.appendChild(ul);
		main.appendChild(tocDiv);

		const introLi = this.tocElement("section0", "Introduction", true);
		ul.appendChild(introLi);

		this.navElement("section0", "Introduction");
		this.navElement("toc", "Table of Contents");

		return ul;
	},
  
	processJSON() {
		const jsonEl = document.getElementById("jsonData");
		if (!jsonEl) return;
		
		const data = JSON.parse(jsonEl.textContent || "{}");
		
		this.dom.body = document.body;
		this.dom.main = document.getElementById("section0");
		
		if (!this.dom.main) return;
		
		this.applyConfig(data);		
		
		this.processHeader(this.dom.main, data.header);
		
		const tocList = this.displayTOC ? this.buildTOC(this.dom.main) : null;
		
		const sections = data.sections ?? [];
		for (let i = 0; i < sections.length; i++) {
			this.processSection(this.dom.main, sections[i], tocList, this.uppercaseHeaders);
		}
		
		if (!this.displayTOC) return;
		
		this.dom.body.classList.add("hasNavBar");
		this.dom.navSelect = document.querySelector(".topNav select");
		this.dom.topLink = document.querySelector("a.top");
		this.dom.toc = document.getElementById("toc");
		
		window.addEventListener("resize", () => this.refreshTopPos());
		window.addEventListener("scroll", () => this.toggleTopButton());
		window.addEventListener("scrollend", () => this.refreshNavBar());
		
		if (this.dom.navSelect) {
			this.dom.navSelect.addEventListener("change", this.navSection);
			this.dom.navSelect.focus();
		}
		
		this.populateNavSections();
		this.refreshTopPos();
		this.refreshNavBar();
	},
	
	populateNavSections() {
		this.navSections = Array.from(document.querySelectorAll(".navSection")).reverse()
	},
	
	refreshTopPos() {
		const toc = this.dom.toc ?? document.getElementById("toc");
		if (!toc) return;
		this.scrollTopPos = toc.offsetTop;
	},
	
	refreshNavBar() {
		const select = this.dom.navSelect ?? document.querySelector(".topNav select");
		if (!select) return;
	
		for (let i = 0; i < this.navSections.length; i++) {
			const s = this.navSections[i];
			if (s.offsetTop < window.scrollY + 100) {
				select.value = `#${s.id}`;
				break;
			}
		}
	},
	toggleTopButton() {
		const top = this.dom.topLink ?? document.querySelector("a.top");
		if (!top) return;
		
		const y = window.scrollY || 0;
		if (y > this.scrollTopPos + 30) {
			top.className = "top visible";
			top.href = "#toc";
		} else {
			top.className = "top";
			top.removeAttribute("href");
		}
	},
	
	simpleElement(type, html) {
		const el = document.createElement(type);
		el.innerHTML = html ?? "";
		return el;
	},
	
	processHeaderSection(headerElem, section) {
		if (!section) return;
		
		if (section.title) {
			headerElem.appendChild(this.simpleElement("h3", section.title));
		}
		
		const content = section.content ?? [];
		
		for (let i = 0; i < content.length; i++) {
			headerElem.appendChild(this.simpleElement("p", content[i]));
		}
	},
	
	processHeader(main, header) {
		if (!header) return;
		
		const headerElem = document.createElement('div');
		headerElem.className = "header";
		
		if (header.image) {
			const img = document.createElement("img");
			img.src = header.image;
			headerElem.appendChild(img);
		}
		
		if (header.title) {
			headerElem.appendChild(this.simpleElement("h1", `${header.title} InvisiClues™`));
		}
		
		headerElem.appendChild(this.simpleElement("h2", "Introduction"));
		
		this.processHeaderSection(headerElem, header.section1);
		this.processHeaderSection(headerElem, header.section2);
		
		if (header.sampleQuestions) {
			const sampleElem = document.createElement("div");
			this.processSection(sampleElem, header.sampleQuestions, null, false, null);
			headerElem.appendChild(sampleElem);
		}

		this.processHeaderSection(headerElem, header.section3);

		main.appendChild(headerElem);
	},
	
	tocElement(sectionId, title, hasQuestions) {
		const li = document.createElement("li");
		if (!hasQuestions) {
			li.innerHTML = title;
			return li;
		}
		
		const a = document.createElement("a");
		a.innerHTML = title;
		a.href = `#${sectionId}`;
		li.appendChild(a);
		return li;
	},
	
	navGroup(title) {
		const select = document.querySelector(".topNav select");
		if (!select) return null;

		const group = document.createElement("optgroup");
		group.label = title;
		select.appendChild(group);
		return group;
	},
	
	navElement(sectionId, title, optGroup) {
		const select = document.querySelector(".topNav select");
		if (!select) return;

		const opt = document.createElement("option");
		opt.value = `#${sectionId}`;
		opt.innerHTML = title;

		(optGroup ?? select).appendChild(opt);
	},
	
	processSection(main, section, tocUl, upper, optGroup) {
		if (!section) return;
		
		let liElem = null;
		
		const titleText = section.title ?? "";
		if (titleText !== "") {
			const tocEnabled = section.toc ?? true;
			const tocTitle = section.tocTitle ?? titleText;
			
			if (Object.prototype.hasOwnProperty.call(section, "upper")) {
				upper = !!section.upper;
			}
			
			const titleEl = this.titleElement(titleText, tocEnabled ? "h2" : "h5", tocEnabled, upper, tocEnabled);

			const sectionId = titleEl.id;
			main.appendChild(titleEl);
			
			if (tocUl && tocEnabled) {
				const hasQuestions = (section.questions?.length ?? 0) > 0 || 
					(section.images?.length ?? 0) > 0 || 
					(section.paragraphs?.length ?? 0) > 0;
					
				liElem = this.tocElement(sectionId, tocTitle, hasQuestions);
				tocUl.appendChild(liElem);
				
				if (hasQuestions) {
					this.navElement(sectionId, tocTitle, optGroup);
				}
			}
		}
		
		if (section.subTitle) {
			main.appendChild(this.titleElement(section.subTitle, "h4", false, false, false));
		}
		
		const paragraphs = section.paragraphs ?? [];
		for (let i = 0; i < paragraphs.length; i++) {
			main.appendChild(this.simpleElement("p", paragraphs[i]));
		}
		
		if (Array.isArray(section.questions)) {
			const hiddenTitles = !!section.hiddenTitles;
			for (let i = 0; i < section.questions.length; i++) {
				main.appendChild(this.questionElement(section.questions[i], i, hiddenTitles));
			}
		}
		
		const images = section.images ?? [];
		for (let i = 0; i < images.length; i++) {
			main.appendChild(this.imageElement(images[i]));
		}
		
		const subs = section.subSections ?? [];
		if (subs.length > 0) {
			const groupTitle = section.tocTitle ?? section.title ?? "";
			const subGroup = this.navGroup(groupTitle);
			
			for (let i = 0; i < subs.length; i++) {
				let ulSub = null;
				if (liElem) {
					ulSub = document.createElement("ul");
					ulSub.className = "indented";
					liElem.appendChild(ulSub);
				}
				this.processSection(main, subs[i], ulSub, false, subGroup);
			}
		}
    },
	
	titleElement(text, type, setId, upper, navSection) {
		const el = document.createElement(type);

		if (setId) {
			el.id = `section${this.index}`;
			this.index++;
		}

		const classes = [];
		if (upper) classes.push("upper");
		if (navSection) classes.push("navSection");
		if (classes.length) el.className = classes.join(" ");

		el.innerHTML = text ?? "";
		
		return el;
	},
	
	answerElement(label, ariaLabel, text, question) {
		const row = document.createElement("div");
		row.className = "answer-row";
		
		const alwaysShow = !!question?.alwaysShow;
		if (!alwaysShow) row.addEventListener("click", this.toggle);
	

		if (label) {
			const lbl = document.createElement("div");
			lbl.className = "answer-label";
			lbl.innerHTML = label;
			row.appendChild(lbl);
		}
		
		const cell = document.createElement("div");
		cell.className = "answer-cell";
		cell.setAttribute("aria-label", ariaLabel ?? "");
		cell.setAttribute("role", "alert");
		
		const ans = document.createElement("span");
		ans.className = "answer";
		if (!alwaysShow) ans.style.visibility = "hidden";
		
		if (Array.isArray(text) && Array.isArray(question?.columns)) {
			for (let i = 0; i < question.columns.length; i++) {
				const col = question.columns[i];
				const sub = document.createElement("span");
				sub.className = "answer-col";
				
				const styles = [`width: ${col.width}`];
				if (col.align) styles.push(`text-align: ${col.align}`);
				sub.setAttribute("style", styles.join("; "));
				
				sub.innerHTML = text[i] ?? "";
				ans.appendChild(sub);
			}
		} else {
			ans.innerHTML = text ?? "";
		}
		
		cell.appendChild(ans);
		row.appendChild(cell);
		
		return row;
	},
		
	columnHeaders(hasLabel, columns) {
		const header = document.createElement("div");
		header.className = "answer-header";
	
		if (hasLabel) {
			const lbl = document.createElement("div");
			lbl.className = "answer-label";
			header.appendChild(lbl);
		}
		
		const cell = document.createElement("div");
		cell.className = "answer-cell";
		
		for (let i = 0; i < columns.length; i++) {
			const col = columns[i];
			const span = document.createElement("span");
			span.className = "answer-col";
			
			const styles = [`width: ${col.width}`];
			if (col.align) styles.push(`text-align: ${col.align}`);
			span.setAttribute("style", styles.join("; "));
			
			span.appendChild(document.createTextNode(col.header ?? ""));
			cell.appendChild(span);
		}
		
		header.appendChild(cell);		
		return header;
	},
	
	indexToLetters(i) {
		return String.fromCharCode(65 + (i % 26)).repeat(Math.floor(i / 26) + 1)
	},
	
	answersElement(question) {
		const q = question ?? {};
		const answers = q.answers ?? [];
		
		const hasLabel = !!q.customLabels || !!q.orderedList;
		
		const wrapper = document.createElement("div");
		const classes = ["answers"];
		if (q.anyAnswer) classes.push("anyAnswer");
		if (q.noPadding) classes.push("no-padding");
		if (hasLabel && this.offsetAnswers) classes.push("offset");
		wrapper.className = classes.join(" ");

		if (q.columns && (q.columnHeaders ?? true)) {
			wrapper.appendChild(this.columnHeaders(hasLabel, q.columns));
		}
		
		const numberedList = q.numberedList ?? this.numberedList;
		const answerCount = answers.length;
		
		for (let i = 0; i < answerCount; i++) {
			let answer = answers[i];

			let ariaLabel = "";
			let label = "";
			
			const singleBulletPoints = typeof q.singleBulletPoints === "boolean" ? q.singleBulletPoints : this.singleBulletPoints;
			
			if (q.customLabels && Array.isArray(answer)) {
				ariaLabel = answer.shift() ?? "";
				label = ariaLabel;
			} else if (q.orderedList) {
				if (answerCount === 1 && !singleBulletPoints) {
					ariaLabel = "";
					label = " ";
				} else {
					ariaLabel = numberedList ? String(i + 1) : this.indexToLetters(i);
					
					if (q.listPrefix) ariaLabel = q.listPrefix + ariaLabel;
					label = ariaLabel + (q.listSuffix ?? ".");
				}
			}
			
			wrapper.appendChild(this.answerElement(label, ariaLabel, answer, q));
		}
		
		return wrapper;
	},
	
	questionElement(question, index, hiddenTitles) {
		const q = question ?? {};
		
		const el = document.createElement("div");
		const classes = ["question"];
		if (q.class) classes.push(q.class);
		el.className = classes.join(" ");
		
		if (q.title) {
			let titleEl;
						
			if (hiddenTitles) {
				titleEl = document.createElement("div");
				titleEl.className = "answers title";
				
				const aria = String(index + 1);
				const label = `${aria}.`;
				titleEl.appendChild(this.answerElement(label, aria, q.title, { alwaysShow: false }));
			} else {
				titleEl = this.titleElement(q.title, "h3", false, false, false);
			}
			
			el.appendChild(titleEl);
		}
		
		if (q.subTitle) {
			 el.appendChild(this.titleElement(q.subTitle, "h4", false, false, false));
		}
		
		if (!Object.prototype.hasOwnProperty.call(q, "orderedList")) {
			q.orderedList = this.orderedList;
		}
		
		if (!Object.prototype.hasOwnProperty.call(q, "noPadding")) {
			q.noPadding = this.noPadding;
		}

		el.appendChild(this.answersElement(q));
		return el;
	},
	
	imageElement(src) {
		const img = document.createElement("img");
		img.className = "sectionImg";
		img.src = src;
		return img;
	},
	
	toggle() {
		const span = this.querySelector(".answer");
		if (!span) return;
		
		const visible = span.style.visibility !== "hidden";
		const parent = span.closest(".answers");
		if (!parent) return;
		
		if (parent.classList.contains("anyAnswer")) {
			span.style.visibility = visible ? "hidden" : "visible";
			return;
		}
		
		let answers = parent.querySelectorAll(".answer-row .answer-cell .answer");
		answers = Array.from(answers);
		
		if (visible) answers.reverse();
		
		for (let i = 0; i < answers.length; i++) {
			answers[i].style.visibility = visible ? "hidden" : "visible";
			if (span === answers[i]) break;
		}
	},
	
	toggleTitle() {
		const span = this.querySelector("span");
		if (!span) return;
		
		const visible = span.style.visibility !== "hidden";
		span.style.visibility = visible ? "hidden" : "visible";
	},
	
	navSection() {
		location.href = this.value;
		document.querySelector(".topNav select")?.focus();
	}
}
document.addEventListener("DOMContentLoaded", function(event) { 
	invisiClues.processJSON();
});