
[![MasterHead](https://res.cloudinary.com/uwy0e8qw/image/upload/f_auto,q_auto/Tesseract_Civic_Safety_Dashboard)](https://rishavchanda.io)

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&duration=3000&pause=700&color=2563EB&center=true&vCenter=true&width=800&lines=Initializing...;Street-Level+Civic+Hazard+Tracker;Making+Our+Streets+Safer...;Report.+Track.+Resolve." alt="Typing Animation"/>
</p>

<h1 align="center">🚧 Street-Level Civic & Road Hazard Tracker hi  </h1> 

<h3 align="center">A smarter, faster way to report road hazards and make our streets safer.</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Project-CivicTech-blue?style=for-the-badge" alt="Civic Tech"/>
  <img src="https://img.shields.io/badge/Focus-Road%20Safety-orange?style=for-the-badge" alt="Road Safety"/>
  <img src="https://img.shields.io/badge/Event-Hackathon-green?style=for-the-badge" alt="Hackathon"/>
  <img src="https://img.shields.io/badge/Status-Prototype-yellow?style=for-the-badge" alt="Project Status"/>
</p>


##  1. Chosen Problem Statement

### Street-Level Civic and Road Hazard Tracker

Commuters face dangerous road and public infrastructure hazards, including open manholes, dangling electrical wires, broken footpaths, potholes, and waterlogging.

Existing reporting processes can discourage people from reporting these problems, leaving risks unaddressed and authorities without a real-time picture of which hazards need urgent attention.

We aim to build a hyper-local reporting platform that enables citizens to submit hazard reports with photographs, location pins, or voice notes. These reports feed into a public safety map and a severity-ranked municipal dashboard, with resolution supported by photographic evidence.

**Our mission:** Make reporting easier, hazards more visible, and resolution more transparent.

---

## 👥 2. Team Member Names + USNs

| No. | Team Member Name | USN | Role |
|---|---|---|---|
| 1 | [Aishik Roy] | [2392608067] | Team Lead & Integration |
| 2 | [ Shambhuraje Kendre] | [2392608003] | Frontend Development |
| 3 | [Ranjan Kumar Sahu] | [2392608057] | Backend & APIs |
| 4 | [ Ziyad Azmat Parkar] | [2392608237] | Database & Maps |
| 5 | [Harshit Vyas] | [2392608125] | Testing & Documentation |
| 6 | [Sambhav Bohra] | [2392608043] | PPT & Framework Handling


---

##  3. What We Built & Why ?

###  Our Solution

We are developing a citizen-focused civic reporting platform that connects people who encounter hazards with the teams responsible for resolving them.

The platform is designed to simplify reporting, identify dangerous locations, prioritize urgent issues, and make resolution progress more transparent.

###  Key Features

<table>
<tr>
<td width="50%" valign="top">

### 📸 Quick Hazard Reporting

Submit hazard details, descriptions, photographs, and location information.

</td>
<td width="50%" valign="top">

###  Public Safety Map

Visualize reported hazards geographically and identify affected areas.

</td>
</tr>
<tr>
<td width="50%" valign="top">

###  Severity-Based Prioritization

Help prioritize reports according to hazard type, urgency, and potential harm.

</td>
<td width="50%" valign="top">

###  Municipal Dashboard

Give authorized personnel a centralized view of reported hazards and their statuses.

</td>
</tr>
<tr>
<td width="50%" valign="top">

###  Resolution Tracking

Track reports through Reported, In Progress, and Resolved stages.

</td>
<td width="50%" valign="top">

### 📷 Resolution Verification

Support report closure with photographs showing completed repairs.

</td>
</tr>
</table>

### ⚙️ How It Works

1. **Spot a hazard:** A citizen encounters a road or public infrastructure problem.
2. **Submit a report:** The citizen adds the hazard type, description, photograph, and location.
3. **Process the report:** The application stores the report and assigns or calculates its severity.
4. **Display the hazard:** The report appears on the public safety map.
5. **Prioritize action:** Authorized personnel review reports and update their statuses.
6. **Verify resolution:** Supporting photographic evidence can be added when the hazard is resolved.

### 🗺️ Hazard Categories

| Category | Examples |
|---|---|
| Road Damage | Potholes and damaged roads |
| Open Manholes | Uncovered or damaged manholes |
| Electrical Hazards | Exposed or dangling electrical wires |
| Public Infrastructure | Broken footpaths and damaged structures |
| Drainage Problems | Waterlogging and blocked drains |
| Other Hazards | Additional public safety risks |

### 🛠️ Technology Stack

The following are proposed technology options. Keep only the technologies actually used in your implementation.

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,js,react,tailwind,vite" alt="Frontend Technology Stickers"/>
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,express,python,fastapi" alt="Backend Technology Stickers"/>
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=postgres,firebase,git,github,vercel" alt="Database and Deployment Technology Stickers"/>
</p>

| Layer | Technology Options | Purpose |
|---|---|---|
| Frontend | React, JavaScript | Interactive user interface |
| Styling | HTML, CSS, Tailwind CSS | Responsive layouts and design |
| Build Tool | Vite | Frontend development and production builds |
| Backend | Node.js/Express or Python/FastAPI | APIs and application logic |
| Database | PostgreSQL or Firebase | Persistent report storage |
| Maps | Leaflet + OpenStreetMap | Display hazard locations |
| Version Control | Git + GitHub | Collaboration and source control |
| Deployment | Vercel or another suitable host | Publish the application |

**Note:** These are technology options, not a claim that all of them have been implemented.

###  Prototype & Demo

- **Live Demo:** [Add your deployed application URL]
- **Demo Video:** [Add your demonstration video URL]
- **Screenshots:** Add screenshots of your actual working application here.

---

##  4. Clear Run & Installation Instructions

###  Prerequisites

Install the tools required by your chosen implementation.

<p align="center">
  <img src="https://skillicons.dev/icons?i=git,github,nodejs,npm,vscode" alt="Development Tool Stickers"/>
</p>

- [Git](https://git-scm.com/downloads) — version control
- [Node.js](https://nodejs.org/) — for React/Vite or Node.js projects
- npm — included with Node.js
- [Visual Studio Code](https://code.visualstudio.com/) or another code editor
- A modern web browser
- Database credentials and API keys, if required

### Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_NAME>
```

Replace the placeholders with your actual GitHub repository URL and directory name.

### Step 2: Install Dependencies

For a React/Vite project containing a `package.json` file, run:

```bash
npm install
```

This installs the dependencies specified by your project.

### Step 3: Configure Environment Variables

Create the environment file required by your application.

Example for a Vite frontend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Example for a backend that uses a database:

```env
DATABASE_URL=your_database_connection_string
MAP_API_KEY=your_map_provider_key
```

These are examples only. Use the exact variable names expected by your application.

**Security:** Never commit passwords, private API keys, or production credentials to GitHub. Variables prefixed with `VITE_` are exposed to the browser and must not contain secrets.

### Step 4: Start the Frontend

For a React/Vite project:

```bash
npm run dev
```

Open the local address printed in your terminal. It is commonly:

```text
http://localhost:5173
```

### Step 5: Start the Backend

If your project uses Node.js and Express, open another terminal in the backend directory:

```bash
npm install
npm run dev
```

The exact startup command depends on the scripts in your backend's `package.json`.

If your project instead uses Python and FastAPI, install its dependencies and start the application using the appropriate entry point:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

This example assumes that `main.py` contains a FastAPI instance named `app`. Adjust the command to match your implementation.

### Step 6: Connect the Frontend, Backend, and Database

- Configure the frontend API URL.
- Start the backend server.
- Configure the database connection.
- Set up the map service, if required.
- Verify that the frontend can communicate with the backend.
- Test report submission, retrieval, and status updates.

### Step 7: Build for Production

For a Vite frontend:

```bash
npm run build
```

The production files are normally generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

### 🧰 Technology-Specific Setup Summary

| Technology | Installation or Setup |
|---|---|
| React/Vite | `npm install` |
| Node.js/Express | Install backend dependencies using `npm install` |
| Python/FastAPI | Install dependencies using `pip install -r requirements.txt` |
| PostgreSQL | Configure the database and connection string |
| Firebase | Configure the Firebase project and required credentials |
| Leaflet/OpenStreetMap | Install and configure the mapping dependencies |
| Git/GitHub | Clone the repository and manage code changes |
| Vercel | Configure the project build and deployment settings |

Use only the rows that apply to your actual project.

### 🔍 Troubleshooting

| Problem | What to Check |
|---|---|
| `npm` command not found | Install Node.js and reopen the terminal |
| Dependency installation fails | Check `package.json` and the Node.js version |
| Frontend cannot reach backend | Check the API URL, server status, and CORS configuration |
| Map is not loading | Check map configuration and browser console errors |
| Database connection fails | Check credentials, network access, and connection settings |
| Animation is missing | Verify the GIF URL and image-host availability |

---

## 📌 5. Honest Unfinished Feature List

We believe in demonstrating what works rather than claiming features that are still under development.

Update this checklist according to the current implementation.

### Implementation Checklist

- [ ] Citizen hazard reporting
- [ ] Photograph upload
- [ ] Location selection or browser geolocation
- [ ] Interactive public safety map
- [ ] Severity-ranked dashboard
- [ ] Report status tracking
- [ ] Photo-based resolution verification
- [ ] Voice-note reporting
- [ ] Persistent database storage
- [ ] Responsive mobile interface
- [ ] Authentication and role-based access
- [ ] Live deployment

### Known Limitations

- [ ] Features still under development
- [ ] Backend or database integrations still pending
- [ ] Map or external API limitations
- [ ] Testing and deployment issues

Update these lists honestly: check a feature only when it is implemented and working.

### 🔮 Future Scope

- AI-assisted hazard classification from uploaded photographs
- Duplicate report detection for nearby locations
- Improved severity estimation and emergency-risk prioritization
- Multilingual and voice-assisted reporting
- Notifications when report statuses change
- Analytics for recurring hazards and unresolved hotspots
- Integration with municipal workflows where authorized APIs or partnerships are available

---

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit your work with a meaningful message.
5. Open a pull request describing your contribution.

Please do not include sensitive personal information, private location data, or API secrets in commits.

##  Contact

For questions, feedback, or collaboration, contact the team through GitHub Issues or Discussions.

- **Repository:** (https://tesseract-nine-theta.vercel.app/)
- **Team Contact:** Aishik Roy - 9257203509/aishik.roy1234@gmail.com

---

<h2 align="center"> Our Vision</h2>

<p align="center">
  Safer Streets. Smarter Reporting. Transparent Resolution.
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=20&duration=3000&pause=800&color=16A34A&center=true&vCenter=true&width=700&lines=Report+Faster.;Prioritize+Smarter.;Build+Safer+Streets." alt="Project Vision Animation"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Made%20For-Civic%20Safety-2563EB?style=for-the-badge" alt="Civic Safety"/>
  <img src="https://img.shields.io/badge/Driven%20By-Innovation-16A34A?style=for-the-badge" alt="Innovation"/>
</p>

<p align="center">
  Built with ❤️ by our hackathon team.
</p>
