import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Table is "users", not "user": `user` is a reserved word in Postgres.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Stored lowercased; lookups lowercase the input too.
  @Column({ unique: true })
  email: string;

  // Excluded from regular queries; select it explicitly where a password is checked.
  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
