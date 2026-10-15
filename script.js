document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const views = $$(".view");
  const navButtons = $$(".nav-btn");
  const viewLabel = $("#view-label");
  const toast = $("#toast");

  const courses = {
    web: {title:"Web Galaxy",type:"CREATIVE ENGINEERING",description:"Build beautiful websites using HTML, CSS and JavaScript.",lesson:"HTML & CSS Foundations",icon:"</>",progress:40},
    python: {title:"Python Nebula",type:"LOGIC & INTELLIGENCE",description:"Learn programming logic and solve problems with Python.",lesson:"Variables & Basic Logic",icon:"Py",progress:20},
    design: {title:"Design Dimension",type:"DESIGN & IMAGINATION",description:"Explore visual design, UI/UX and creative thinking.",lesson:"Introduction to UI/UX",icon:"✳",progress:10}
  };

  const state = {xp:120,lessons:12,streak:3,completedMissions:new Set(),explored:new Set(["web"]),activity:[]};
  let activeCourse = "web";
  let toastTimer;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function navigate(viewId) {
    const target = document.getElementById(viewId);
    if (!target || !target.classList.contains("view")) return;
    views.forEach(view => view.classList.toggle("active", view.id === viewId));
    navButtons.forEach(button => button.classList.toggle("active", button.dataset.view === viewId));
    viewLabel.textContent = viewId.replace("-", " ").toUpperCase();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  navButtons.forEach(button => button.addEventListener("click", () => navigate(button.dataset.view)));
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-open]");
    if (button) navigate(button.dataset.open);
  });

  function addActivity(title, description) {
    state.activity.unshift({title,description});
    state.activity = state.activity.slice(0,6);
    renderActivity();
  }

  function renderActivity() {
    const log = $("#activity-log");
    if (!log) return;
    log.replaceChildren();
    const activities = state.activity.length ? state.activity : [{title:"Journey initiated",description:"Your learning universe has been created."}];
    activities.forEach(item => {
      const row = document.createElement("div"); row.className = "activity-item";
      const icon = document.createElement("span"); icon.textContent = "✦";
      const details = document.createElement("div");
      const title = document.createElement("strong"); title.textContent = item.title;
      const description = document.createElement("p"); description.textContent = item.description;
      details.append(title,description);
      const time = document.createElement("small"); time.textContent = "Just now";
      row.append(icon,details,time); log.append(row);
    });
  }

  function updateCourseUI(courseId) {
    const course = courses[courseId], pct = course.progress;
    [[`#${courseId}-bar`,`#${courseId}-pct`],[`#${courseId}-bar-all`,`#${courseId}-pct-all`]].forEach(([barSelector,textSelector]) => {
      const bar = $(barSelector), text = $(textSelector);
      if (bar) bar.style.width = pct + "%";
      if (text) text.textContent = pct + "%";
    });
  }

  function renderStats() {
    $("#xp").textContent = state.xp;
    $("#journey-xp").textContent = state.xp;
    $("#hero-lessons").textContent = state.lessons;
    $("#journey-lessons").textContent = state.lessons;
    $("#hero-streak").innerHTML = `${state.streak} <em>days</em>`;
    $("#journey-worlds").textContent = `${state.explored.size} / ${Object.keys(courses).length}`;
    const level = Math.floor(state.xp / 200) + 1;
    const currentLevelXP = state.xp % 200;
    $("#hero-level").textContent = String(level).padStart(2,"0");
    $("#level-title").textContent = `Level ${String(level).padStart(2,"0")} — ${level === 1 ? "Cosmic Beginner" : "Universe Explorer"}`;
    $("#level-bar").style.width = (currentLevelXP / 200 * 100) + "%";
    $("#level-xp").textContent = `${currentLevelXP} / 200 XP`;
    $("#level-next").textContent = `${200-currentLevelXP} XP to next level`;
    Object.keys(courses).forEach(updateCourseUI);
  }

  const modal = $("#course-modal");
  function renderModal() {
    const course = courses[activeCourse];
    $("#modal-title").textContent = course.title;
    $("#modal-type").textContent = course.type;
    $("#modal-description").textContent = course.description;
    $("#modal-planet").textContent = course.icon;
    $("#lesson-title").textContent = course.lesson;
    $("#modal-bar").style.width = course.progress + "%";
    $("#modal-pct").textContent = course.progress + "% explored";
    const completed = course.progress >= 100;
    $("#start-lesson").disabled = completed;
    $("#start-lesson").innerHTML = completed ? "World completed ✓" : "Begin lesson <span>↗</span>";
  }

  function openCourse(courseId) {
    if (!courses[courseId]) return;
    activeCourse = courseId;
    state.explored.add(courseId);
    renderModal(); renderStats();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    $("#modal-close").focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  }

  $$("[data-course]").forEach(button => button.addEventListener("click", event => {
    event.stopPropagation(); openCourse(button.dataset.course);
  }));

  $$(".world-card").forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest("button")) return;
      if (card.dataset.world) openCourse(card.dataset.world);
    });
    card.addEventListener("keydown", event => {
      if (event.target !== card) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); openCourse(card.dataset.world);
      }
    });
  });

  $("#modal-close").addEventListener("click",closeModal);
  modal.addEventListener("click",event => {if(event.target===modal) closeModal();});
  document.addEventListener("keydown",event => {if(event.key==="Escape") closeModal();});

  $("#start-lesson").addEventListener("click",() => {
    const course = courses[activeCourse];
    if (!course || course.progress >= 100) return;
    course.progress = Math.min(course.progress + 10,100);
    state.xp += 20; state.lessons += 1;
    renderStats(); renderModal();
    addActivity(`${course.title} · Lesson completed`,`You earned 20 XP. World progress is now ${course.progress}%.`);
    notify(course.progress===100 ? "World mastered! Amazing work. +20 XP" : "Lesson completed! +20 XP earned.");
  });

  $$(".mission-complete").forEach(button => button.addEventListener("click",() => {
    const id = Number(button.dataset.mission);
    if (state.completedMissions.has(id)) {notify("You have already completed this mission.");return;}
    if (id===0 && state.lessons<=12) {navigate("worlds");notify("Choose a world and complete your first lesson!");return;}
    if (id===1 && state.explored.size<2) {navigate("worlds");notify("Explore at least two learning worlds first!");return;}
    if (id===2 && state.lessons<15) {navigate("worlds");notify("Complete three more lessons to unlock this mission.");return;}
    const rewards=[20,40,60];
    state.completedMissions.add(id); state.xp+=rewards[id];
    button.textContent="Completed ✓"; button.disabled=true;
    addActivity(`Mission ${id+1} completed`,`You earned ${rewards[id]} XP. Keep exploring!`);
    renderStats(); notify(`Mission complete! +${rewards[id]} XP`);
  }));

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".tilt-card").forEach(card => {
      card.addEventListener("pointermove",event => {
        const rect=card.getBoundingClientRect(), x=(event.clientX-rect.left)/rect.width, y=(event.clientY-rect.top)/rect.height;
        card.style.transform=`perspective(900px) rotateX(${(.5-y)*7}deg) rotateY(${(x-.5)*9}deg) translateY(-2px)`;
      });
      card.addEventListener("pointerleave",()=>{card.style.transform="";});
    });
    const stage=$("#universe-stage");
    stage.addEventListener("pointermove",event=>{
      const rect=stage.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
      stage.style.transform=`perspective(850px) rotateY(${x*12}deg) rotateX(${-y*10}deg)`;
    });
    stage.addEventListener("pointerleave",()=>{stage.style.transform="";});
  }

  $("#theme-button").addEventListener("click",()=>{
    document.body.classList.toggle("light-mode");
    const isLight=document.body.classList.contains("light-mode");
    $("#theme-button").textContent=isLight?"☀":"◐";
    $("#theme-button").title=isLight?"Switch to dark mode":"Switch to light mode";
  });

  const stars=$("#stars");
  for(let i=0;i<35;i++){
    const star=document.createElement("span");
    star.style.cssText=`position:absolute;left:${(i*37+11)%100}%;top:${(i*61+7)%100}%;width:${i%7===0?3:2}px;height:${i%7===0?3:2}px;border-radius:50%;background:${i%3===0?"#8eefff":"#c4baff"};opacity:${.15+(i%6)*.12};animation:twinkle ${2+(i%4)}s ease-in-out infinite alternate;`;
    stars.append(star);
  }
  renderStats(); renderActivity();
});
