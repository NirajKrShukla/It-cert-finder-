import { Link } from "react-router-dom";
import { FaAws, FaMicrosoft, FaGoogle, FaDocker } from "react-icons/fa6";
import { SiCisco, SiComptia, SiKubernetes, SiRedhat, SiDatabricks, SiMongodb, SiPostgresql, SiSnowflake } from "react-icons/si";
import { FaShieldHalved, FaBriefcase, FaCube, FaDatabase, FaBrain, FaArrowRight } from "react-icons/fa6";

const vendorIcon = (v) => {
    const map = {
        "AWS": FaAws, "Microsoft": FaMicrosoft, "Google": FaGoogle,
        "Cisco": SiCisco, "CompTIA": SiComptia, "Docker": FaDocker,
        "Red Hat": SiRedhat, "Linux Foundation": SiKubernetes, "HashiCorp": FaCube,
        "Databricks": SiDatabricks, "Salesforce": FaCube, "ISC2": FaShieldHalved,
        "ISACA": FaShieldHalved, "EC-Council": FaShieldHalved, "OffSec": FaShieldHalved,
        "PMI": FaBriefcase, "Scrum Alliance": FaBriefcase,
        "Oracle": FaDatabase, "VMware": FaCube, "MongoDB": SiMongodb,
        "EnterpriseDB": SiPostgresql, "Snowflake": SiSnowflake, "IBM": FaCube,
        "DataStax": FaDatabase, "NVIDIA": FaBrain, "DeepLearning.AI": FaBrain, "CertNexus": FaBrain,
    };
    return map[v] || FaCube;
};

export default function CertificateCard({ cert }) {
    const Icon = vendorIcon(cert.vendor);
    return (
        <Link to={`/certificate/${cert.slug}`} className="dcard block p-6 group" data-testid={`cert-card-${cert.slug}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 border border-[#30363D] bg-[#0A0E14] grid place-items-center text-[#E6EDF3] group-hover:border-[#39FF6A] group-hover:text-[#39FF6A] transition-colors">
                        <Icon className="text-xl" />
                    </div>
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7D8590]">{cert.vendor}</div>
                        <div className={`chip lvl-${cert.level} mt-1.5`} data-testid={`cert-level-${cert.slug}`}>{cert.level}</div>
                    </div>
                </div>
                {cert.trending && (
                    <span className="chip chip-amber" data-testid={`trending-${cert.slug}`}>🔥 Trending</span>
                )}
                {cert.ai_generated && !cert.trending && (
                    <span className="chip chip-magenta">AI</span>
                )}
            </div>

            <h3 className="font-display font-semibold text-xl mt-5 leading-tight text-[#E6EDF3] group-hover:text-white" data-testid={`cert-name-${cert.slug}`}>
                {cert.name}
            </h3>
            <p className="text-sm text-[#B1BAC4] mt-2 line-clamp-2 leading-relaxed">
                {cert.description}
            </p>

            <div className="mt-6 pt-4 border-t border-[#21262D] flex items-end justify-between">
                <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7D8590]">Exam Cost</div>
                    <div className="font-mono font-bold text-3xl leading-none mt-1 text-[#39FF6A]" data-testid={`cert-price-${cert.slug}`}>
                        ${cert.price_usd}
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7D8590]">Domain</div>
                    <div className="font-mono text-sm uppercase mt-1 text-[#E6EDF3]">{cert.domain}</div>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#7D8590] group-hover:text-[#39FF6A] transition-colors">
                View details <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
}
