const url = "https://firestore.googleapis.com/v1/projects/gen-lang-client-0876388327/databases/ai-studio-portfoliodedesar-fac9ba74-48fc-486e-bc0f-7c98428443f5/documents/cv_data/main";
const res = await fetch(url);
const data = await res.json();
console.log(Object.keys(data.fields));
