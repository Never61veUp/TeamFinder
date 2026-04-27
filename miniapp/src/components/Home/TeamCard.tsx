import type {Team} from '../../types/api'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import './home.css'

interface TeamCardProps {
    team: Team
}

export function TeamCard({ team }: TeamCardProps) {
    return (
        <div className="team-card">
            <div className="team-card-header">
                <div className="team-info-group">
                    <h2 className="team-name">{team.name}</h2>
                    {team.event && <p className="team-event">{team.event}</p>}
                </div>
                <div className="team-capacity">
                    {team.currentMembers}/{team.maxMembers}
                </div>
            </div>

            <p className="team-desc">{team.description}</p>

            <div className="skills-list">
                {team.tags.map((tag) => (
                    <Badge key={tag.id} variant="primary">
                        {tag.title}
                    </Badge>
                ))}
            </div>

            <div className="avatars-list">
                {team.members.map((member) => (
                    <div key={member.id} className="mini-avatar">
                        {member.initials}
                    </div>
                ))}
            </div>

            {/* Используем className для кнопки, чтобы применить стили из CSS */}
            <Button size="lg" variant="primary" className="team-card-btn">
                Подробнее
            </Button>
        </div>
    )
}