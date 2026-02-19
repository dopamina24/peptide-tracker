export default function TermsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gradient">Términos de Uso</h1>
                <p className="text-white/40 mt-2">Última actualización: Febrero 2026</p>
            </div>
            <div className="glass-card p-6 space-y-4 prose prose-invert max-w-none">
                <h2 className="text-lg font-semibold">1. Naturaleza de la Aplicación</h2>
                <p className="text-white/70 text-sm leading-relaxed">
                    PeptideTracker es una herramienta de registro personal diseñada exclusivamente para que los usuarios lleven un seguimiento de sus propias administraciones. <strong>No constituye consejo médico, diagnóstico ni tratamiento.</strong>
                </p>
                <h2 className="text-lg font-semibold">2. Aviso Médico Importante</h2>
                <p className="text-white/70 text-sm leading-relaxed">
                    Los péptidos mencionados en esta aplicación son compuestos de investigación. No están aprobados por la FDA ni por ninguna autoridad sanitaria para uso en humanos fuera de contextos clínicos específicos.
                    <strong> Consulta SIEMPRE a un médico calificado antes de iniciar cualquier protocolo.</strong>
                </p>
                <h2 className="text-lg font-semibold">3. Uso Aceptable</h2>
                <p className="text-white/70 text-sm leading-relaxed">
                    Debes tener al menos 18 años. La información de la biblioteca es de carácter educativo. El usuario asume toda responsabilidad por el uso que haga de la información.
                </p>
                <h2 className="text-lg font-semibold">4. Privacidad de Datos</h2>
                <p className="text-white/70 text-sm leading-relaxed">
                    Tus datos de salud se almacenan de forma segura y encriptada. No los vendemos ni compartimos con terceros. Ver Política de Privacidad para más detalles.
                </p>
                <h2 className="text-lg font-semibold">5. Limitación de Responsabilidad</h2>
                <p className="text-white/70 text-sm leading-relaxed">
                    PeptideTracker no se hace responsable por daños o perjuicios derivados del uso de la información contenida en la aplicación.
                </p>
            </div>
            <a href="/dashboard" className="btn-ghost inline-flex">← Volver al inicio</a>
        </div>
    );
}
