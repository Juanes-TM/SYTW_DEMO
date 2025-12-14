import { useState } from "react";
import { User, X } from "lucide-react";

export default function FisioterapeutasListPage() {
  const [selected, setSelected] = useState(null);

    const fisioterapeutas = [
    {
        id: 1,
        nombre: "Laura Martínez",
        foto: "/img/fisio1_avatar.png",
        colegiado: "Nº Colegiado: 28476",
        especialidad: "Fisioterapia Deportiva",
        resumen:
        "Fisioterapeuta especializada en deporte y readaptación al rendimiento. Enfoque basado en prevención y recuperación funcional.",
        descripcionLarga:
        "Fisioterapeuta con más de 8 años de experiencia en el sector deportivo. Especializada en prevención de lesiones, recuperación funcional y readaptación al rendimiento. Ha trabajado con atletas de élite y equipos profesionales. Su trato cercano y su visión integral permiten una rehabilitación efectiva y adaptada a cada paciente.",
        experiencia: [
        "8 años de experiencia en fisioterapia deportiva",
        "Ex-fisioterapeuta del Club Atletismo Tenerife",
        "Certificación en terapia manual avanzada",
        ],
    },

    {
        id: 2,
        nombre: "Diego Herrera",
        foto: "/img/fisio5_avatar.png",
        especialidad: "Fisioterapia Traumatológica",
        colegiado: "Nº Colegiado: 31892",
        resumen:
        "Experto en rehabilitación postquirúrgica, lesiones óseas y recuperación avanzada. Enfoque muy técnico y personalizado.",
        descripcionLarga:
        "Especializado en fisioterapia traumatológica, Diego cuenta con 10 años de experiencia en tratamientos postquirúrgicos, fracturas, prótesis y lesiones graves. Su metodología combina terapia manual, ejercicio terapéutico y tecnología avanzada para acelerar la recuperación.",
        experiencia: [
        "10 años de experiencia en fisioterapia traumatológica",
        "Colaborador habitual en clínicas de cirugía ortopédica",
        "Formación avanzada en ejercicio terapéutico",
        ],
    },

    {
        id: 3,
        nombre: "Carlos Suárez",
        foto: "/img/fisio3_avatar.png",
        especialidad: "Fisioterapia Neurológica",
        colegiado: "Nº Colegiado: 29541",
        resumen:
        "Profesional especializado en neurorehabilitación tanto de adultos como de niños. Enfoque humano y progresivo.",
        descripcionLarga:
        "Carlos es especialista en fisioterapia neurológica, con experiencia en rehabilitación de ictus, lesiones medulares y enfermedades neurodegenerativas. Destaca por su paciencia, capacidad didáctica y la personalización de cada intervención.",
        experiencia: [
        "Especialista en rehabilitación neurológica",
        "Diplomado en neurofisiología clínica",
        "Trabajó en centros de referencia en neurorehabilitación",
        ],
    },

    {
        id: 4,
        nombre: "María López",
        foto: "/img/fisio4_avatar.png",
        especialidad: "Fisioterapia Respiratoria",
        colegiado: "Nº Colegiado: 31007",
        resumen:
        "Especialista en terapia respiratoria para adultos y niños. Amplia experiencia en patologías crónicas.",
        descripcionLarga:
        "María ha dedicado gran parte de su carrera a la fisioterapia respiratoria, tratando pacientes con EPOC, asma, fibrosis quística y secuelas post-covid. Su enfoque combina educación terapéutica, ejercicios respiratorios y tecnología asistida.",
        experiencia: [
        "Más de 6 años en fisioterapia respiratoria",
        "Especialista en patologías crónicas y pediátricas",
        "Formación en técnicas de drenaje bronquial",
        ],
    },

    {
        id: 5,
        nombre: "Javier Torres",
        foto: "/img/fisio2_avatar.png",
        especialidad: "Fisioterapia General y Terapia Manual",
        colegiado: "Nº Colegiado: 27789",
        resumen:
        "Amplia experiencia en terapia manual, dolor crónico y tratamientos globales. Enfoque integrativo.",
        descripcionLarga:
        "Javier es un fisioterapeuta muy completo, con una visión global del cuerpo y amplia experiencia en dolor crónico, terapia manual y tratamiento musculoesquelético. Su enfoque se basa en la combinación de movilización, ejercicio y educación terapéutica.",
        experiencia: [
        "6 años de experiencia clínica general",
        "Especialista en terapia manual avanzada",
        "Amplia experiencia en tratamiento del dolor crónico",
        ],
    },

    {
        id: 6,
        nombre: "Sara Delgado",
        foto: "/img/fisio6_avatar.png",
        especialidad: "Fisioterapia Pediátrica",
        colegiado: "Nº Colegiado: 33210",
        resumen:
        "Experta en fisioterapia pediátrica y desarrollo motor infantil. Trato cercano seguro para los más pequeños.",
        descripcionLarga:
        "Sara está especializada en fisioterapia pediátrica y desarrollo motor infantil. Trabaja con bebés, niños y adolescentes en trastornos motores, retrasos en el desarrollo y afecciones musculoesqueléticas. Se caracteriza por su empatía, creatividad y comunicación con las familias.",
        experiencia: [
        "Especialista en fisioterapia pediátrica",
        "Formación en neurodesarrollo y psicomotricidad",
        "Más de 5 años tratanto bebés y niños de todas las edades",
        ],
    },
    ];


  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-teal-700 mb-4">
        Equipo de Fisioterapeutas
      </h1>

      <p className="text-gray-600 mb-10 max-w-2xl">
        Consulta la información profesional de nuestro equipo.
        Cada fisioterapeuta cuenta con formación especializada y experiencia amplia.
      </p>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fisioterapeutas.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-2xl shadow-lg p-6 transition transform hover:-translate-y-1 hover:shadow-2xl"
          >
            {f.foto ? (
              <img
                src={f.foto}
                alt={f.nombre}
                className="w-full h-72 object-cover object-top rounded-xl mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-teal-100 rounded-xl mb-4 flex items-center justify-center">
                <User size={60} className="text-teal-600 opacity-70" />
              </div>
            )}

            <h2 className="text-2xl font-semibold text-gray-800">{f.nombre}</h2>
            <p className="text-teal-600 font-medium">{f.especialidad}</p>
            <p className="text-gray-500 text-sm mb-2">{f.colegiado}</p>

            {/* NUEVO RESUMEN MÁS LARGO */}
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {f.resumen}
            </p>

            <button
              onClick={() => setSelected(f)}
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition"
            >
              Ver perfil profesional
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/20"
        >
            <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 overflow-hidden"
            >
            <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 z-20"
            >
                <X size={28} />
            </button>

            {/* FOTO */}
            {selected.foto ? (
                <img
                    src={selected.foto}
                    alt={selected.nombre}
                    className="w-full h-85 object-cover object-top rounded-xl mb-4"
                    />
            ) : (
                <div className="w-full h-56 bg-teal-200 rounded-xl mb-4 flex items-center justify-center z-20">
                <User size={70} className="text-teal-700 opacity-80" />
                </div>
            )}

            <div className="relative z-20">
                <h2 className="text-3xl font-bold text-gray-800">{selected.nombre}</h2>
                <p className="text-teal-600 text-lg font-semibold mt-1">
                {selected.especialidad}
                </p>
                <p className="text-gray-500 mt-1 mb-4">{selected.colegiado}</p>

                <p className="text-gray-700 leading-relaxed mb-6">
                {selected.descripcionLarga}
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Experiencia
                </h3>

                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                {selected.experiencia.map((exp, idx) => (
                    <li key={idx}>{exp}</li>
                ))}
                </ul>

                <button
                onClick={() => setSelected(null)}
                className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition"
                >
                Cerrar
                </button>
            </div>
            </div>
        </div>
        )}

    </div>
  );
}
