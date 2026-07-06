import { Link } from "react-router-dom";
import { FaAws, FaMicrosoft, FaGoogle, FaDocker } from "react-icons/fa6";
import { SiCisco, SiComptia, SiKubernetes, SiRedhat, SiDatabricks, SiMongodb, SiPostgresql, SiSnowflake, SiTensorflow } from "react-icons/si";
import { FaShieldHalved, FaBriefcase, FaCube, FaDatabase, FaBrain } from "react-icons/fa6";

const vendorIcon = (v) => {
    const map = {
        "AWS": FaAws,
        "Microsoft": FaMicrosoft,
        "Google": FaGoogle,
        "Cisco": SiCisco,
        "CompTIA": SiComptia,
        "Docker": FaDocker,
        "Red Hat": SiRedhat,
        "Linux Foundation": SiKubernetes,
        "HashiCorp": FaCube,
        "Databricks": SiDatabricks,
        "Salesforce": FaCube,
        "ISC2": FaShieldHalved,
        "ISACA": FaShieldHalved,
        "EC-Council": FaShieldHalved,
        "OffSec": FaShieldHalved,
        "PMI": FaBriefcase,
        "Scrum Alliance": FaBriefcase,
        "Oracle": FaDatabase,
        "VMware": FaCube,
        "MongoDB": SiMongodb,
        "EnterpriseDB": SiPostgresql,
        "Snowflake": SiSnowflake,
        "IBM": FaCube,
        "DataStax": FaDatabase,
        "NVIDIA": FaBrain,
        "DeepLearning.AI": FaBrain,
        "CertNexus": FaBrain,
    };
    return map[v] || FaCube;
};

export default function CertificateCard({ cert }) {
    const Icon = vendorIcon(cert.vendor);
    const levelClass = `level-${cert.level}`;
    return (
        <Link
            to={`/certificate/${cert.slug}`}
            className="swiss-card block p-6 relative"
            data-testid={`cert-card-${cert.slug}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 border border-black grid place-items-center bg-[#F4F5F6]">
                        <Icon className="text-2xl" />
                    </div>
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#52525B]">{cert.vendor}</div>
                        <div className={`badge-mono ${levelClass} mt-1`} data-testid={`cert-level-${cert.slug}`}>{cert.level}</div>
                    </div>
                </div>
                {cert.ai_generated && (
                    <span className="badge-mono badge-blue" title="AI-enriched">AI</span>
                )}
            </div>

            <h3 className="font-display font-bold text-xl mt-5 leading-tight" data-testid={`cert-name-${cert.slug}`}>
                {cert.name}
            </h3>
            <p className="text-sm text-[#52525B] mt-2 line-clamp-2 leading-relaxed">
                {cert.description}
            </p>

            <div className="mt-6 pt-4 border-t border-black flex items-end justify-between">
                <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#52525B]">Exam Cost</div>
                    <div className="font-display font-bold text-3xl leading-none mt-1" data-testid={`cert-price-${cert.slug}`}>
                        ${cert.price_usd}
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#52525B]">Domain</div>
                    <div className="font-mono text-sm font-bold uppercase mt-1">{cert.domain}</div>
                </div>
            </div>
        </Link>
    );
}
